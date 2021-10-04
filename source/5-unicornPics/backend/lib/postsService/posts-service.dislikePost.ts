let AWSXRay = require('aws-xray-sdk-core');
let AWS = AWSXRay.captureAWS(require('aws-sdk'));

import { APIGatewayProxyHandler } from 'aws-lambda';
import { metricScope, Unit } from "aws-embedded-metrics";

const documentClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const postsTableName = process.env.POSTS_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = metricScope(metrics =>
  async (event) => {
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

      metrics.setNamespace("UnicornPics");
      metrics.putMetric("Dislikes", 1, Unit.Count);
      metrics.setDimensions();

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
)