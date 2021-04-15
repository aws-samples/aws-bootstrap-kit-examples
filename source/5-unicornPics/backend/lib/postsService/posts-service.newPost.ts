import * as AWS from 'aws-sdk';
import { Handler, S3Event } from 'aws-lambda';
const documentClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const s3 = new AWS.S3();
const cloudfrontDistribution = process.env.CLOUDFRONT_DIST;
const postsTableName = process.env.POSTS_TABLE_NAME!;

export const handler: Handler = async (event: S3Event) => {
    for (const post of event.Records) {
        let s3params = {
            Bucket: post.s3.bucket.name,
            Key: post.s3.object.key
        };

        let postDetails;

        try {
            postDetails = await s3.getObject(s3params).promise();
        } catch (error) {
            console.error(error);
            throw new Error(error)
        }

        if (postDetails.Metadata) {
            let dynamoParams = {
                TableName: postsTableName,
                Item: {
                    userId: postDetails.Metadata.userid,
                    postId: postDetails.Metadata.postid,
                    createdAt: postDetails.Metadata.createdat,
                    likes: 0,
                    mediaUrl: 'https://' + cloudfrontDistribution + '/' + post.s3.object.key,
                    ownerName: postDetails.Metadata.ownername
                }
            }

            try {
                await documentClient.put(dynamoParams).promise();
                return true;
            } catch (error) {
                console.error(error)
                throw new Error(error)
            }
        }

    }
    return true;
}