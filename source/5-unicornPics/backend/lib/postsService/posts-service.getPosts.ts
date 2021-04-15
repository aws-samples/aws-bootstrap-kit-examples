import * as AWS from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
const documentClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const postsTableName = process.env.POSTS_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
    const params = {
        TableName: postsTableName,
        Limit: 20
    };
    let scanResult;

    try {
        scanResult = await documentClient.scan(params).promise();
        return {
            "statusCode": 200,
            "headers": {
                'Access-Control-Allow-Origin': '*',
            },
            "body": JSON.stringify(scanResult.Items)
        }
    } catch (error) {
        console.error(error)
        throw new Error(error)
    }
}