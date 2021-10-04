import * as AWS from 'aws-sdk';
import { Handler } from 'aws-lambda';

const USER_POOL_ID = process.env.USER_POOL_ID!;

export const handler: Handler = async (event) => {
    const cognitoIsp = new AWS.CognitoIdentityServiceProvider();
    
    for (let userDescription of event) {
        console.log('Deleting user for ', userDescription);

        const username = userDescription['UserName'];
        try {
            await cognitoIsp.adminDeleteUser({
                Username: username,
                UserPoolId: USER_POOL_ID,
            }).promise();
            console.log('[' + username + '] User deleted.');
        } catch (e) {
            if ((e as AWS.AWSError).code === 'UserNotFoundException') {
                console.log('[' + username + '] User not found.');
            } else {
                console.log('[' + username + '] Error while deleting user', e);
                throw e;
            }

        }
    }

    return {
        "statusCode": 200,
    }
}
