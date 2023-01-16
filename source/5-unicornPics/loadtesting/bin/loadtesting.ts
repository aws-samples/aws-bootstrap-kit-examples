#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LoadtestingStack } from '../lib/loadtesting';

const app = new cdk.App();
new LoadtestingStack(app, 'LoadtestingStack', {});
