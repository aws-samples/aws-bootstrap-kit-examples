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

import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { RootDNSPipelineStack, RootDNSStage } from "../lib/cicd-stack";
import * as bootstrapKit from 'aws-bootstrap-kit';

const app = new cdk.App();

const cicdAccountDetails = app.node
  .tryGetContext("stages")
  .find((stage: any) => stage.name === "CICD");

let rootDNSStackProps: bootstrapKit.RootDNSStackProps;

rootDNSStackProps = {
  rootDnsProps: {
    stagesDetails: app.node.tryGetContext("stages"),
    rootHostedZoneDNSName: app.node.tryGetContext("rootDNSName"),
    thirdPartyProviderDNSUsed: app.node.tryGetContext(
      "thirdPartyProviderDNSUsed"
    ),
  },
  synthesizer: undefined,
  env: {
    account: cicdAccountDetails.id,
    region: app.node.tryGetContext("sharedServicesRegion"),
  },
};

new RootDNSStage(app, "AWSBootstrapKit-RootDNS-Dev", rootDNSStackProps);

new RootDNSPipelineStack(
  app,
  "AWSBootstrapKit-RootDNS-PipelineStack",
  rootDNSStackProps
);
