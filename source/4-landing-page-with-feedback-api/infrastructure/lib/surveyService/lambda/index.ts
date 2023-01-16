import * as AWS from 'aws-sdk';

    const allowedOrigins = ['http://localhost:3000', process.env.Access_Control_Allow_Origin];

    const TABLE_NAME = process.env.TABLE_NAME!;

    const dynamodb = new AWS.DynamoDB();

    exports.handler = async (event: any) => {
      const headers = {
        'Access-Control-Allow-Origin': undefined
      };

      if (allowedOrigins.includes(event['headers']['origin'])) {
        headers['Access-Control-Allow-Origin'] = event['headers']['origin']
      };

      // For SAM local start-api
      if (allowedOrigins.includes(event['headers']['Origin'])) {
        headers['Access-Control-Allow-Origin'] = event['headers']['Origin']
      };

      const body = event['body'];

      const { name, email, subject, details } = JSON.parse(body);
      const key = `${email.toLowerCase()}:${new Date().toISOString()}`;

      const params: AWS.DynamoDB.PutItemInput = {
        TableName: TABLE_NAME,
        Item: {
          'Key': { S: key },
          'Name': { S: name },
          'Email': { S: email },
          'Subject': { S: subject },
          'Details': { S: details }
        }
      };

      await dynamodb.putItem(params).promise();

      return { statusCode: 200, body: 'success', headers };
    }
