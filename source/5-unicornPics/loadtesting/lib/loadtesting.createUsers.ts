import * as AWS from 'aws-sdk';
import { Handler } from 'aws-lambda';

const CLIENT_ID = process.env.CLIENT_ID!;
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD!;

export const handler: Handler = async (event) => {
    for (let userDescription of event) {
        console.log('Creation user for ', userDescription);
        const username = userDescription.UserName;

        const cognitoIsp = new AWS.CognitoIdentityServiceProvider();

        try {
            await cognitoIsp.signUp({
                ClientId: CLIENT_ID,
                Username: username,
                Password: DEFAULT_PASSWORD,
                UserAttributes: [{
                    Name: 'email',
                    Value: username + '@octank.com',
                }],
            }).promise();
            console.log('['+username+'] User created.');
        } catch (e) {
            if ((e as AWS.AWSError).code === 'UsernameExistsException') {
                console.log('['+username+'] User already exists.');
            } else {
                console.log('['+username+'] Error while creating user', e);
                throw e;
            }

        }
    }

    return {
        "statusCode": 200,
    }
}
