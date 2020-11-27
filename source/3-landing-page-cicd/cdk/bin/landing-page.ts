#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LandingPageStage, LandingPagePipelineStack } from '../lib/cicd-stack';
import {AddPermissionsBoundaryToRoles} from "../lib/permission-boundary";

const app = new cdk.App();

// Use for direct deploy to an environment without pipeline
new LandingPageStage(app, 'Test', {});
// Use to deploy the pipeline stack
const pipelineStack = new LandingPagePipelineStack(app, 'LandingPageStackPipeline');

const permissionBoundaryArn = cdk.Fn.importValue('CICDPipelinePermissionsBoundaryArn')

cdk.Aspects.of(pipelineStack).add(new AddPermissionsBoundaryToRoles(permissionBoundaryArn))
