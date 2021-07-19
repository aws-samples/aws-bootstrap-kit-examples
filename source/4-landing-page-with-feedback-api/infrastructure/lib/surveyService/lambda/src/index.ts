import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const allowedOrigins = [
  'http://localhost:3000',
  process.env.Access_Control_Allow_Origin,
];

const TABLE_NAME = process.env.TABLE_NAME!;

const dynamodb = new AWS.DynamoDB();


export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {



  let accessControlAllowOriginHeader: undefined | string;
  let statusCode = 200;
  let responseBody = { message: 'success' };

  if (allowedOrigins.includes(event['headers']['origin'])) {
    accessControlAllowOriginHeader = event['headers']['origin'];
  } else {
  // For SAM local start-api
    accessControlAllowOriginHeader = event['headers']['Origin'];
  }

  const requestBody = event['body'];

  if (!requestBody) {
    statusCode = 400;
    responseBody.message = 'Missing paramters';
  } else {
    const { name, email, subject, details } = JSON.parse(requestBody);

    const key = `${email.toLowerCase()}:${new Date().toISOString()}`;

    const params: AWS.DynamoDB.PutItemInput = {
      TableName: TABLE_NAME,
      Item: {
        Key: { S: key },
        Name: { S: name },
        Email: { S: email },
        Subject: { S: subject },
        Details: { S: details },
      },
    };
    await dynamodb.putItem(params).promise();
  }
  const responseHeaders = accessControlAllowOriginHeader
    ? { 'Access-Control-Allow-Origin': accessControlAllowOriginHeader }
    : undefined;

  const result: APIGatewayProxyResult = {
    statusCode: statusCode,
    body: JSON.stringify(responseBody),
    headers: responseHeaders,
  };

  return result;
};
