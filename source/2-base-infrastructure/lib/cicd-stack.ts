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

import { Construct, Stage, Stack } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as core from "@aws-cdk/core";
import * as bootstrapKit from 'aws-bootstrap-kit/lib/index.js';

export class RootDNSStage extends Stage {
  constructor(scope: Construct, id: string, props: bootstrapKit.RootDNSStackProps) {
    super(scope, id, props);

    new bootstrapKit.RootDNSStack(this, "rootDNS", props);
  }
}

/**
 * Stack to hold the pipeline
 */
export class RootDNSPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: bootstrapKit.RootDNSStackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, "Pipeline", {
      pipelineName: "AWSBootstrapKit-RootDNS",
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        branch: "chazalf/setupScript",
        oauthToken: core.SecretValue.secretsManager("GITHUB_TOKEN"),
        owner: this.node.tryGetContext("github_alias"),
        // TODO: remove "-dev" before release
        repo: "AWSBootstrapKit-dev",
      }),

      synthAction: SimpleSynthAction.standardYarnSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        subdirectory: "source/2-base-infrastructure"
      }),
    });

    const dnsAccount = props.rootDnsProps.stagesDetails.find(
      (stageDetails: any) => stageDetails.name === "DNS"
    );

    let dnsStageEnhancedProps = {
      ...props,
      env: {
        account: dnsAccount?.id,
        region: this.node.tryGetContext("sharedServicesRegion")
      },
    };
    
    pipeline.addApplicationStage(
      new RootDNSStage(this, "Prod", dnsStageEnhancedProps)
    );
  }
}
