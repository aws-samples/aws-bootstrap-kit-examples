import * as AWS from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

const S3Bucket = new AWS.S3({
    signatureVersion: 'v4'});

export const handler: APIGatewayProxyHandler = async (event) => {
    const body = JSON.parse(event.body!);

    const userid = event.requestContext.authorizer!.claims['cognito:username'];
    const ownername = userid;

    const postid = uuidv4();
    const createdat = '' + Math.round((new Date()).getTime() / 1000);

    const key = postid + '.jpg';
    const params = {
        Bucket: process.env.POST_BUCKET_NAME,
        Key: key,
        Expires: 15 * 60, // 15 minutes
        ContentType: 'image/jpg',
        ACL: 'private',
        Metadata: {
            userid: userid,
            postid: postid,
            createdat: createdat,
            ownername: ownername
        }
    };

    const url = await S3Bucket.getSignedUrlPromise('putObject', params);

    return {
        "statusCode": 200,
        "headers": {
            'Access-Control-Allow-Origin': '*',
        },
        "body": JSON.stringify({
            'url': url,
            'postid': postid,
            'userid': userid,
            'createdat': createdat,
            'ownername': ownername
        })
    }
}
