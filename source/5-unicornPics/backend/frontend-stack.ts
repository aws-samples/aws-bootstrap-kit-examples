import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";

export class FrontEndStack extends cdk.Stack {
  public readonly activateBucket: s3.Bucket;
  public readonly activateDistribution: cloudfront.Distribution;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.activateBucket = new s3.Bucket(this, "activateBucket", {
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    this.activateDistribution = new cloudfront.Distribution(
      this,
      "activateDistribution",
      {
        defaultBehavior: {
          origin: new origins.S3Origin(this.activateBucket),
        },
      }
    );
  }
}

