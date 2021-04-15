import * as AWS from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
const documentClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const postsTableName = process.env.POSTS_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.pathParameters ? event.pathParameters.user_id : {};
  const params = {
    TableName: postsTableName,
    KeyConditionExpression: 'userId = :id',
    ExpressionAttributeValues: {
      ':id': userId
    }
  };

  let queryResult;

  try {
    queryResult = await documentClient.query(params).promise();
    return {
      "statusCode": 200,
      "headers": {
        'Access-Control-Allow-Origin': '*',
      },
      "body": JSON.stringify(queryResult.Items)
    }
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }

};
