import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as eventSources from "@aws-cdk/aws-lambda-event-sources";
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as path from 'path';
import { Auth } from '../common/auth';

interface PostsServiceProps {
  activateDistribution: cloudfront.Distribution;
  userAuth: Auth,
  activateBucket: s3.Bucket
}

export class PostsService extends cdk.Construct {
  public readonly postsApi: apigateway.RestApi;

  constructor(scope: cdk.Construct, id: string, props: PostsServiceProps) {
    super(scope, id);

    // create dynamodb table

    const table = new dynamodb.Table(this, 'posts', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'postId', type: dynamodb.AttributeType.STRING },
    });

    // Create rest API
    this.postsApi = new apigateway.RestApi(this, "posts-api", {
      restApiName: "Posts Service",
      description: "This service manages posts.",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    const auth = new apigateway.CfnAuthorizer(this, 'APIGatewayAuthorizer', {
      name: 'activate-authorizer',
      identitySource: 'method.request.header.Authorization',
      providerArns: [props.userAuth.userPool.userPoolArn],
      restApiId: this.postsApi.restApiId,
      type: apigateway.AuthorizationType.COGNITO,
    });

    // create newPost lambda function
    const newPost = new lambda.NodejsFunction(this, 'newPost',
    {
      environment: {
        POSTS_TABLE_NAME: table.tableName,
        CLOUDFRONT_DIST: props.activateDistribution.distributionDomainName
      }
    });

    newPost.addEventSource(new eventSources.S3EventSource(props.activateBucket, {
      events: [s3.EventType.OBJECT_CREATED]
    }));

    // create getPosts lambda function
    const getPosts = new lambda.NodejsFunction(this, 'getPosts',
    {
      environment: {
        POSTS_TABLE_NAME: table.tableName,
      }
    });

    const getPostsIntegration = new apigateway.LambdaIntegration(getPosts, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    this.postsApi.root.addMethod("GET", getPostsIntegration, {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: { authorizerId: auth.ref }
    });

    // create getPostsById lambda function
    const getPostsById = new lambda.NodejsFunction(this, 'getPostsById',
    {
      environment: {
        POSTS_TABLE_NAME: table.tableName,
      }
    });

    const getPostsByIdIntegration = new apigateway.LambdaIntegration(getPostsById, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    const users = this.postsApi.root.addResource('users');
    const user = users.addResource('{user_id}');
    user.addMethod("GET", getPostsByIdIntegration, {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: { authorizerId: auth.ref }
    });

    // create likePost lambda function
    const likePost = new lambda.NodejsFunction(this, 'likePost',
    {
      environment: {
        POSTS_TABLE_NAME: table.tableName,
      }
    });

    const likePostIntegration = new apigateway.LambdaIntegration(likePost, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    const like = this.postsApi.root.addResource('like');
    like.addMethod("PUT", likePostIntegration, {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: { authorizerId: auth.ref }
    });

    // create dislikePost lambda function
    const dislikePost = new lambda.NodejsFunction(this, 'dislikePost',
    {
      environment: {
        POSTS_TABLE_NAME: table.tableName,
      }
    });

    const dislikePostIntegration = new apigateway.LambdaIntegration(dislikePost, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    const dislike = this.postsApi.root.addResource('dislike');
    dislike.addMethod("PUT", dislikePostIntegration, {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: { authorizerId: auth.ref }
    });

    // Add prepare post method
    const preparePost = new lambda.NodejsFunction(this, 'preparePost',
    {
      environment: {
        POST_BUCKET_NAME: props.activateBucket.bucketName
      }
    });

    props.activateBucket.grantPut(preparePost);

    const preparePostIntegration = new apigateway.LambdaIntegration(preparePost, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    const preparePostResource = this.postsApi.root.addResource('preparepost');
    preparePostResource.addMethod("PUT", preparePostIntegration, {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: { authorizerId: auth.ref }
    });

    // Grant read/write permissions to lambda
    table.grantWriteData(getPosts);
    table.grantReadData(getPosts);
    table.grantWriteData(getPostsById);
    table.grantReadData(getPostsById);
    table.grantWriteData(likePost);
    table.grantWriteData(dislikePost);
    table.grantWriteData(newPost);

    // Grant read permission to lambda
    props.activateBucket.grantRead(newPost);


    new cdk.CfnOutput(this, 'apiEndpoint', {value: this.postsApi.url, exportName: 'apiEndpoint'});
  }
}