#!/usr/bin/env node

import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { InfrastructureStack } from "../lib/infrastructure-stack";
// import { LandingPagePipelineStack } from "../lib/cicd-pipeline-stack";
// import { AddPermissionsBoundaryToRoles } from "../lib/permission-boundary";

const app = new cdk.App();

new InfrastructureStack(app, 'LandingPageStack-dev', {});

// const pipelineStack = new LandingPagePipelineStack(app, 'LandingPagePipelineStack');

// // Respect cdk bootstrap policy insuring pipelines construct can't create more than what it needs for CI/CD pipeline creation
// const permissionBoundaryArn = cdk.Fn.importValue('CICDPipelinePermissionsBoundaryArn');
// cdk.Aspects.of(pipelineStack).add(new AddPermissionsBoundaryToRoles(permissionBoundaryArn));