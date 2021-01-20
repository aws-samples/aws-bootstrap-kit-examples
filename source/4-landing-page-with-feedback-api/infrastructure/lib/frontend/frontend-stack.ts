#!/usr/bin/env node
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as core from '@aws-cdk/core';
import * as targets from "@aws-cdk/aws-route53-targets";
import * as bootstrapKit from "aws-bootstrap-kit/lib/index.js";
import {
    DnsValidatedCertificate,
    CertificateValidation,
} from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";


export interface FrontendStackProps extends core.StackProps {
    stage?: string;
    rootDomain?: string;
    serviceName: string;
}

/**
 * Static site infrastructure, which deploys site content to an S3 bucket and expose it through Cloudfront.
 */
export class FrontendStack extends core.NestedStack {
    public readonly distribution: cloudfront.CloudFrontWebDistribution;
    public readonly frontendUrl: string;
    public readonly siteBucket: s3.Bucket;
    constructor(parent: core.Construct, name: string, props: FrontendStackProps) {
        super(parent, name);

        core.Tags.of(this).add(
            "ServiceName",
            props.serviceName
        );

        const uiBuildFolder = `${__dirname}/../../../ui/build`;

        // Content bucket
        this.siteBucket = new s3.Bucket(this, 'SiteBucket', {
            websiteIndexDocument: "index.html",
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });

        const landingPageOAI = new cloudfront.OriginAccessIdentity(this, "SiteOAI");




        // If DNS info is available, creating all the records to get a proper dns name
        if (props.rootDomain) {
            const stage = props.stage??'dev';
            this.frontendUrl = `${props.serviceName}.${stage}.${props.rootDomain}`;

            const delegatedHostedZone = new bootstrapKit.CrossAccountDNSDelegator(
                this,
                "subzoneDelegation",
                {
                    zoneName: this.frontendUrl,
                }
            );

            const certificate = new DnsValidatedCertificate(
                this,
                "Certificate",
                {
                    hostedZone: delegatedHostedZone.hostedZone,
                    domainName: this.frontendUrl,
                    region: "us-east-1",
                    validation: CertificateValidation.fromDns(
                        delegatedHostedZone.hostedZone
                    ),
                }
            );

            const viewerCertificate = cloudfront.ViewerCertificate.fromAcmCertificate(
                certificate,
                {
                    aliases: [this.frontendUrl],
                }
            );

            this.distribution = new cloudfront.CloudFrontWebDistribution(
                this,
                "SiteDistribution",
                {
                    originConfigs: [
                        {
                            s3OriginSource: {
                                s3BucketSource: this.siteBucket,
                                originAccessIdentity: landingPageOAI,
                            },
                            behaviors: [
                                {
                                    isDefaultBehavior: true,
                                },
                            ],
                        },
                    ],
                    viewerCertificate: viewerCertificate
                        ? viewerCertificate
                        : undefined,
                }
            );

            new route53.ARecord(this, "Alias", {
                zone: delegatedHostedZone.hostedZone,
                recordName: this.frontendUrl,
                target: route53.RecordTarget.fromAlias(
                    new targets.CloudFrontTarget(this.distribution)
                ),
            });

        } else {
            // CloudFront distribution without specific dns records
            this.distribution = new cloudfront.CloudFrontWebDistribution(
                this,
                'SiteDistribution',
                {
                    originConfigs: [
                        {
                            s3OriginSource: {
                                s3BucketSource: this.siteBucket,
                                originAccessIdentity: landingPageOAI,
                            },
                            behaviors: [
                                {
                                    isDefaultBehavior: true,
                                },
                            ],
                        },
                    ],
                }
            );
            this.frontendUrl = this.distribution.distributionDomainName;
        }

        // Deploy site contents to S3 bucket
        new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
            sources: [s3deploy.Source.asset(uiBuildFolder)],
            destinationBucket: this.siteBucket,
            distribution: this.distribution,
            distributionPaths: ['/*'],
        });
    }
}
