#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LandingPageStage, LandingPackPipelineStack } from '../lib/cicd-stack';

const app = new cdk.App();

// Use for direct deploy to an environment without pipeline
new LandingPageStage(app, 'LandingPageStage', {});
// Use to deploy the pipeline stack
new LandingPackPipelineStack(app, 'LandingPageStackPipeline');
