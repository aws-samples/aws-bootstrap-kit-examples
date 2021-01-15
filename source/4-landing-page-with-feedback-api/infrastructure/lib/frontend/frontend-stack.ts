#!/usr/bin/env node
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as core from '@aws-cdk/core';
import * as origins from '@aws-cdk/aws-cloudfront-origins';

/**
 * Static site infrastructure, which deploys site content to an S3 bucket and expose it through Cloudfront.
 */
export class FrontendStack extends core.NestedStack {
    public readonly distribution: cloudfront.Distribution;
    public readonly siteBucket: s3.Bucket;
    constructor(parent: core.Construct, name: string) {
        super(parent, name);

        const uiBuildFolder = `${__dirname}/../../../ui/build`;

        // Content bucket
        this.siteBucket = new s3.Bucket(this, 'SiteBucket');

        // CloudFront distribution
        this.distribution = new cloudfront.Distribution(
            this,
            'SiteDistribution',
            {
                defaultBehavior: { origin: new origins.S3Origin(this.siteBucket) },
                defaultRootObject: 'index.html',
            }
        );
        
        // Deploy site contents to S3 bucket
        new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
            sources: [s3deploy.Source.asset(uiBuildFolder)],
            destinationBucket: this.siteBucket,
            distribution: this.distribution,
            distributionPaths: ['/*'],
        });
    }
}
