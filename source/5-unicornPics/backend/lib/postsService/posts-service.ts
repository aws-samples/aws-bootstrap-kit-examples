import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as eventSources from "@aws-cdk/aws-lambda-event-sources";
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from "@aws-cdk/aws-lambda";
import { Auth } from '../common/auth';

interface PostsServiceProps {
  activateDistribution: cloudfront.Distribution;
  userAuth: Auth,
  activateBucket: s3.Bucket
}

export class PostsService extends cdk.Construct {
  public readonly postsApi: apigateway.RestApi;
  public readonly table: dynamodb.Table;

  constructor(scope: cdk.Construct, id: string, props: PostsServiceProps) {
    super(scope, id);

    // create dynamodb table

    this.table = new dynamodb.Table(this, 'posts', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'postId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Create rest API
    this.postsApi = new apigateway.RestApi(this, "posts-api", {
      restApiName: "Posts Service",
      deployOptions: {
        metricsEnabled: true,
        tracingEnabled: true
      },
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
    const newPost = new lambdaNode.NodejsFunction(this, 'newPost',
    {        
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        POSTS_TABLE_NAME: this.table.tableName,
        CLOUDFRONT_DIST: props.activateDistribution.distributionDomainName
      }
    });

    newPost.addEventSource(new eventSources.S3EventSource(props.activateBucket, {
      events: [s3.EventType.OBJECT_CREATED]
    }));

    // create getPosts lambda function
    const getPosts = new lambdaNode.NodejsFunction(this, 'getPosts',
    {        
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        POSTS_TABLE_NAME: this.table.tableName,
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
    const getPostsById = new lambdaNode.NodejsFunction(this, 'getPostsById',
    {        
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        POSTS_TABLE_NAME: this.table.tableName,
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
    const likePost = new lambdaNode.NodejsFunction(this, 'likePost',
    {        
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        POSTS_TABLE_NAME: this.table.tableName,
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
    const dislikePost = new lambdaNode.NodejsFunction(this, 'dislikePost',
    {        
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        POSTS_TABLE_NAME: this.table.tableName,
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
    const preparePost = new lambdaNode.NodejsFunction(this, 'preparePost',
    {        
      tracing: lambda.Tracing.ACTIVE,
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
    this.table.grantWriteData(getPosts);
    this.table.grantReadData(getPosts);
    this.table.grantWriteData(getPostsById);
    this.table.grantReadData(getPostsById);
    this.table.grantWriteData(likePost);
    this.table.grantWriteData(dislikePost);
    this.table.grantWriteData(newPost);

    // Grant read permission to lambda
    props.activateBucket.grantRead(newPost);


    new cdk.CfnOutput(this, 'apiEndpoint', {value: this.postsApi.url, exportName: 'apiEndpoint'});
  }
}