#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { PipelineStack, InfrastructureStage } from "../lib/pipeline-stack";

const app = new cdk.App();
// Use for direct deploy to an environment without pipeline
new InfrastructureStage(app, "InfrastructureStage");
// Use to deploy the pipeline stack
new PipelineStack(app, "PipelineStack");
