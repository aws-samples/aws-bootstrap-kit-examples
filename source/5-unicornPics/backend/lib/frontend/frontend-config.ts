import * as cdk from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';
import { Auth } from '../common/auth';
import { PostsService } from '../postsService/posts-service';
import { Frontend } from './frontend';

export interface FrontendConfigProps {
  auth: Auth;
  postService: PostsService;
  frontend: Frontend;
}

export class FrontendConfig extends cdk.Construct {
  public readonly config: string;

  constructor(scope: cdk.Construct, id: string, props: FrontendConfigProps) {
    super(scope, id);

    this.config = JSON.stringify({
      Auth: {
        region: cdk.Stack.of(props.auth).region,
        userPoolId: props.auth.userPool.userPoolId,
        userPoolWebClientId: props.auth.userPoolClient.userPoolClientId,
      },
      API: {
        endpoints: [
          {
            name: props.postService.postsApi.restApiName,
            endpoint: props.postService.postsApi.url,
          },
        ],
      },
      Analytics: {
        disabled: true,
      },
    });

    const configDeployment = new cr.AwsCustomResource(this, 'WriteS3ConfigFile', {
      onUpdate: {
        service: 'S3',
        action: 'putObject',
        parameters: {
          Body: this.config,
          Bucket: props.frontend.activateBucket.bucketName,
          Key: 'config.json',
        },
        physicalResourceId: cr.PhysicalResourceId.of(Date.now().toString()), // always write this file
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });

    configDeployment.node.addDependency(props.frontend.siteDeployment);

    new cdk.CfnOutput(this, 'frontendConfig', {
        value: this.config
    });
  }
}
