import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as path from 'path';

export class Frontend extends cdk.Construct {
  public readonly activateBucket: s3.Bucket;
  public readonly activateDistribution: cloudfront.Distribution;
  public readonly siteDeployment: s3deploy.BucketDeployment;

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    this.activateBucket = new s3.Bucket(this, 'activateBucket', {
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    this.activateDistribution = new cloudfront.Distribution(
      this,
      'activateDistribution',
      {
        defaultBehavior: {
          origin: new origins.S3Origin(this.activateBucket),
        },
        defaultRootObject: 'index.html',
        errorResponses: [
          { httpStatus: 404, responsePagePath: '/index.html', responseHttpStatus: 200 },
        ],
      }
    );


    this.activateBucket.addCorsRule({
      allowedMethods: [
        s3.HttpMethods.PUT
      ],
      allowedHeaders: [
        "*"
      ],
      allowedOrigins: [
        '*', // `https://${this.activateDistribution.distributionDomainName}`, => Circular dependency
      ]
    }); 

    this.siteDeployment = new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [
        s3deploy.Source.asset(path.resolve(__dirname, '../../../webapp/build')),
      ],
      destinationBucket: this.activateBucket,
      distribution: this.activateDistribution,
      distributionPaths: ['/*'],
    });

    new cdk.CfnOutput(this, 'websiteUrl', {
      value: `https://${this.activateDistribution.distributionDomainName}`
    });
  }
}
