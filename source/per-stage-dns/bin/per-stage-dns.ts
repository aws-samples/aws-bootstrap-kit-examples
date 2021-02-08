#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DNSInfrastructureStack } from '../lib/dns-infrastructure-stack';
import { DNSInfrastructurePipelineStack } from '../lib/cicd-pipeline-stack';
 import { AddPermissionsBoundaryToRoles } from "../lib/permission-boundary";

const app = new cdk.App();
new DNSInfrastructureStack(app, 'DNS-Infrastructure', {stageName: 'dev'});


const pipelineStack = new DNSInfrastructurePipelineStack(app, 'DNS-Pipeline');

// Respect cdk bootstrap policy insuring pipelines construct can't create more than what it needs for CI/CD pipeline creation
const permissionBoundaryArn = cdk.Fn.importValue('CICDPipelinePermissionsBoundaryArn');
cdk.Aspects.of(pipelineStack).add(new AddPermissionsBoundaryToRoles(permissionBoundaryArn));