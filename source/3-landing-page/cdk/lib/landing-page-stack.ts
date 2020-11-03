import * as cdk from '@aws-cdk/core';
import { BlockPublicAccess, Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { CloudFrontWebDistribution, OriginAccessIdentity } from '@aws-cdk/aws-cloudfront';
import { CfnOutput } from '@aws-cdk/core';


export class LandingPageStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const landingPageBucket = new Bucket(this, 'LandingPageBucket', {
      websiteIndexDocument: 'index.html',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL
    });

    new BucketDeployment(this, 'LandingPageDeployment',
    {
      sources: [Source.asset('../www')],
      destinationBucket: landingPageBucket,
      retainOnDelete: false
    });

    const landingPageOAI = new OriginAccessIdentity(this, "LandingPageOAI");

    const landingPageWebDistribution = new CloudFrontWebDistribution(this, 'LandingPageDistribution',
    {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: landingPageBucket,
            originAccessIdentity: landingPageOAI
          },
          behaviors: [
            {
              isDefaultBehavior: true
            }
          ]
        }
      ]
    });

    new CfnOutput(this, "CloudFrontWebDistributionUrl", {
      value: landingPageWebDistribution.distributionDomainName,
      exportName: "LandingPageUrl"
    })
  }
}
