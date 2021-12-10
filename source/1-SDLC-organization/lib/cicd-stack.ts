/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import { Construct } from 'constructs';
import { Stage, Stack } from 'aws-cdk-lib/core';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as core from "aws-cdk-lib/core";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as bootstrapKit from 'aws-bootstrap-kit';

/**
 * Properties for create Landing Zone pipeline stack
 */
export interface AWSBootstrapKitLandingZonePipelineStackProps extends bootstrapKit.AwsOrganizationsStackProps{

  /**
   * Regions for the applications to be deployed. The format of values is the region short-name (e.g. eu-west-1).
   *
   * We use AWS CDK to deploy applications in our application CI/CD pipeline. CDK requires some resources
   * (e.g. AWS S3 bucket) to perform deployment. The regions specified here will be bootstraped with these resources
   * so that it is deployable.
   *
   * See https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html
   */
  readonly pipelineDeployableRegions: string[],
}

/**
 * Stage in the pipeline for deploying LandingZone via aws-bootstrap-kit
 */
export class AWSBootstrapKitLandingZoneStage extends Stage {
  constructor(scope: Construct, id: string, props: bootstrapKit.AwsOrganizationsStackProps) {
    super(scope, id, props);

    new bootstrapKit.AwsOrganizationsStack(this, 'orgStack', props);
  }
}

/**
 * Stack to hold the pipeline to deploy Landing Zone
 */
export class AWSBootstrapKitLandingZonePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: AWSBootstrapKitLandingZonePipelineStackProps) {
    super(scope, id, props);

    const source = pipelines.CodePipelineSource.gitHub(
      `${this.node.tryGetContext('github_alias')}/${this.node.tryGetContext('github_repo_name')}`,
      this.node.tryGetContext('github_repo_branch'),
      {
        authentication: core.SecretValue.secretsManager('GITHUB_TOKEN')
      }
    );

    const pipelineName = 'AWSBootstrapKit-LandingZone';

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: pipelineName,
      crossAccountKeys: true,
      synth: new pipelines.ShellStep('Synth', {
        input: source,
        commands: [
          `cd source/1-SDLC-organization`,
          'npm install',
          'npx cdk synth'
        ],
        primaryOutputDirectory: "source/1-SDLC-organization/cdk.out",
        env: {
          NPM_CONFIG_UNSAFE_PERM: 'true'
        }
      }),
    });

    new core.CfnOutput(this, "PipelineConsoleUrl", {
      value: `https://${Stack.of(this).region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipelineName}/view?region=${Stack.of(this).region}`,
    });

    const prodStage = pipeline.addStage(new AWSBootstrapKitLandingZoneStage(this, 'Prod', props));

    const deployableRegions = props.pipelineDeployableRegions ?? [Stack.of(this).region];
    const regionsInShellScriptArrayFormat = deployableRegions.join(' ');

    prodStage.addPre(
      new pipelines.ManualApprovalStep('Approval')
    );

    prodStage.addPost(
      new pipelines.CodeBuildStep('CDKBootstrapAccounts', {
        commands: [
          'set -eu',
          'cd source/1-SDLC-organization/',
          'npm install',
          `REGIONS_TO_BOOTSTRAP="${regionsInShellScriptArrayFormat}"`,
          './lib/auto-bootstrap.sh "$REGIONS_TO_BOOTSTRAP"'
        ],
        input: source,
        rolePolicyStatements:[
          new iam.PolicyStatement({
            actions: [
              'sts:AssumeRole'
            ],
            resources: ['arn:aws:iam::*:role/OrganizationAccountAccessRole'],
          }),
          new iam.PolicyStatement({
            actions: [
              'organizations:ListAccounts',
              'organizations:ListTagsForResource'
            ],
            resources: ['*'],
          }),
        ],
    }))
  }
}
