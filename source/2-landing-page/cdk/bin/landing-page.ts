#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LandingPageStack } from '../lib/landing-page-stack';

const app = new cdk.App();

new LandingPageStack(app, 'LandingPageStack');