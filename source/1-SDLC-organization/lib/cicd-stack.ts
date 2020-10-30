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

import { Construct, Stage, Stack } from '@aws-cdk/core';
import { CdkPipeline, SimpleSynthAction, ShellScriptAction } from '@aws-cdk/pipelines';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as core from "@aws-cdk/core";
import * as iam from '@aws-cdk/aws-iam';
import * as bootstrapKit from 'aws-bootstrap-kit/lib/index.js';

/**
* Your application
*
* May consist of one or more Stacks (here, two)
*
* By declaring our DatabaseStack and our ComputeStack inside a Stage,
* we make sure they are deployed together, or not at all.
*/
export class AWSBootstrapKitLandingZoneStage extends Stage {
  constructor(scope: Construct, id: string, props: bootstrapKit.AwsOrganizationsStackProps) {
    super(scope, id, props);

    new bootstrapKit.AwsOrganizationsStack(this, 'orgStack', props);
  }
}

/**
* Stack to hold the pipeline
*/
export class AWSBootstrapKitLandingZonePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: bootstrapKit.AwsOrganizationsStackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, 'Pipeline', {
      pipelineName: 'AWSBootstrapKit-LandingZone',
      cloudAssemblyArtifact,
      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: 'GitHub',
        output: sourceArtifact,
        branch:  this.node.tryGetContext('github_repo_branch'),
        oauthToken: core.SecretValue.secretsManager('GITHUB_TOKEN'),
        owner: this.node.tryGetContext('github_alias'),
        repo: this.node.tryGetContext('github_repo_name'),
      }),

      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        subdirectory: 'source/1-SDLC-organization',
        installCommand: 'npm install'
      }),
  });

  const prodStage = pipeline.addApplicationStage(new AWSBootstrapKitLandingZoneStage(this, 'Prod', props));
  const INDEX_START_DEPLOY_STAGE =  prodStage.nextSequentialRunOrder() - 2; // 2 = Prepare (changeSet creation) + Deploy (cfn deploy)
  prodStage.addManualApprovalAction({actionName: 'Validate', runOrder: INDEX_START_DEPLOY_STAGE});

  prodStage.addActions(new ShellScriptAction(
    {
      actionName: 'CDKBootstrapAccounts',
      commands: [
        'cd ./source/1-SDLC-organization/',
        'npm install',
        './lib/auto-bootstrap.sh'
      ],
      additionalArtifacts: [sourceArtifact],
      rolePolicyStatements: [
        new iam.PolicyStatement({
          actions: [
            'organizations:ListAccounts',
            'sts:AssumeRole'
          ],
          resources: ['arn:aws:iam::*:role/OrganizationAccountAccessRole'],
        }),
        new iam.PolicyStatement({
          actions: [
            'organizations:ListAccounts',
          ],
          resources: ['*'],
        }),
      ],
    }
  ));
  }
}
