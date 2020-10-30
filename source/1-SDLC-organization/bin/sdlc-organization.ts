/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
  
Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as bootstrapKit from 'aws-bootstrap-kit/lib/index.js';
import {AWSBootstrapKitLandingZonePipelineStack, AWSBootstrapKitLandingZoneStage} from '../lib/cicd-stack';

const app = new cdk.App();

let stackProps: bootstrapKit.AwsOrganizationsStackProps;
stackProps = {
    email: app.node.tryGetContext("email"),
    nestedOU: [
        {
            name: 'SharedServices',
            accounts: [
                {
                    name: 'CICD'
                }
            ]
        },
        {
            name: 'SDLC',
            accounts: [
                {
                    name: 'Dev'
                },
                {
                    name: 'Staging'
                }
            ]
        },
        {
            name: 'Prod',
            accounts: [
                {
                    name: 'Prod'
                }
            ]
        }
    ]
}

new AWSBootstrapKitLandingZoneStage(app, 'AWSBootstrapKit-LandingZone-Dev', stackProps);

new AWSBootstrapKitLandingZonePipelineStack(app, 'AWSBootstrapKit-LandingZone-PipelineStack', stackProps);
