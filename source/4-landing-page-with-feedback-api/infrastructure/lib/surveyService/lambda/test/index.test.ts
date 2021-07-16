import * as surveyService from '../src';
import { APIGatewayProxyEvent } from 'aws-lambda';


const mockPutItemPromise = jest.fn();

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: jest.fn().mockImplementation(() => { return {
      putItem: jest.fn().mockReturnThis(),
      promise: (params: any) => mockPutItemPromise(params),
    }}),
  };
});

test('Happy case test', async () => {

  const TEST_ORIGIN = 'http://localhost:3000';
  process.env.Access_Control_Allow_Origin = TEST_ORIGIN;
  const TEST_PARAMETERS = {
    name: 'test_name',
    email: 'test_email',
    subject: 'test_subject',
    details: 'test_details',
  };

  const event: APIGatewayProxyEvent = {
    headers: {
      origin: TEST_ORIGIN,
    },
    body: JSON.stringify(TEST_PARAMETERS),
  } as any;

  // WHEN
  const result = await surveyService.handler(event);

  // THEN
  expect(mockPutItemPromise).toHaveBeenCalled;
  expect(JSON.parse(result.body).message).toEqual('success');
  expect(result.headers!['Access-Control-Allow-Origin']).toEqual(TEST_ORIGIN);
});
