import * as AWS from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
const documentClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const postsTableName = process.env.POSTS_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body!);

  const userId = body.user;
  const postId = body.post;

  const params = {
    TableName: postsTableName,
    Key: {
      "userId": userId,
      "postId": postId
    },
    UpdateExpression: "set likes = likes - :val",
    ExpressionAttributeValues: {
      ":val": 1
    },
    ReturnValues: "UPDATED_NEW"
  };
  let updatedValue;

  try {
    updatedValue = await documentClient.update(params).promise();
    return {
      "statusCode": 200,
      "headers": {
        'Access-Control-Allow-Origin': '*',
      },
      "body": JSON.stringify(updatedValue)
    }
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}