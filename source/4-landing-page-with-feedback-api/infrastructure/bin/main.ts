#!/usr/bin/env node

import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { InfrastructureStack } from "../lib/infrastructure-stack";
// import { LandingPagePipelineStack } from "../lib/cicd-pipeline-stack";

import {ensure_correct_node_version} from "../../../utils/versions";

ensure_correct_node_version();

const app = new cdk.App();

new InfrastructureStack(app, 'LandingPageStack-dev', {});

// new LandingPagePipelineStack(app, 'LandingPagePipelineStack');
