#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { LandingPagePipelineStack, LandingPageStage } from "../lib/cicd-pipeline-stack";
import { InfrastructureStack } from "../lib/infrastructure-stack";
const app = new cdk.App();

new InfrastructureStack(app, 'LandingPageStack-dev', {});

new LandingPagePipelineStack(app, 'LandingPagePipelineStack');
