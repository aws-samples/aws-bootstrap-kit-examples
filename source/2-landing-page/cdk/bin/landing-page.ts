#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LandingPageStack } from '../lib/landing-page-stack';
import {ensure_correct_node_version} from "../../../utils/versions";

ensure_correct_node_version();

const app = new cdk.App();

new LandingPageStack(app, 'LandingPageStack');