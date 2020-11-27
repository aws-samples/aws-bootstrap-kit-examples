import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as LandingPage from '../lib/landing-page-stack';

test('Stack is Tagged', () => {
  const app = new cdk.App({
    context: {
      service_name: 'Landing-Page'
    }
  });
  const stack = new LandingPage.LandingPageStack(app, 'MyTestStack', {stage: 'test'});
  expectCDK(stack).to(
    haveResource('AWS::S3::Bucket', {
      Tags: [
        {
          Key: 'ServiceName',
          Value: 'Landing-Page'
        }
      ]
    })
  );
  expectCDK(stack).to(
    haveResource('AWS::Lambda::Function', {
      Tags: [
        {
          Key: 'ServiceName',
          Value: 'Landing-Page'
        }
      ]
    })
  );
});
