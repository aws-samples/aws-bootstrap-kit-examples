#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LandingPageStack } from '../lib/landing-page-stack';

const app = new cdk.App();

new LandingPageStack(app, 'LandingPageStack');