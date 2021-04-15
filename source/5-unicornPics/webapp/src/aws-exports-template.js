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
import { Auth } from "aws-amplify";

const awsconfig =  {
    "Auth": {
        "region": "$AWS_REGION", 
        "userPoolId": $COGNITO_USER_POOL_ID, 
        "userPoolWebClientId": $COGNITO_USER_POOL_CLIENT_ID,
    },
    "API": {
        "endpoints": [
            {
                name: "MyAPIGatewayAPI",
                endpoint: $API_ENDPOINT,
                custom_header: async () => { 
                    return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
                }
            }
        ]
    },
    // This is to avoid promise warning in the console
    // Other options are available : https://github.com/aws-amplify/amplify-js/issues/5918
    "Analytics": {
        "disabled": true,
    },
};


export default awsconfig;