import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';
import { InfrastructureStack } from '../lib/infrastructure-stack';

test('Stack is Tagged', () => {
  const app = new App({
    context: {
      service_name: 'Ecommerce-App'
    }
  });
  const stack = new InfrastructureStack(app, 'MyTestStack');
  expectCDK(stack).to(
    haveResource('AWS::S3::Bucket', {
      Tags: [
        {
          Key: 'ServiceName',
          Value: 'Ecommerce-App'
        }
      ]
    })
  );
  expectCDK(stack).to(
    haveResource('AWS::RDS::DBCluster', {
      Tags: [
        {
          Key: 'ServiceName',
          Value: 'Ecommerce-App'
        }
      ]
    })
  );
});
