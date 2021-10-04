import * as cdk from '@aws-cdk/core';
import { Auth } from '../common/auth';
import { PostsService } from '../postsService/posts-service';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';

export interface MonitoringConfigProps {
  auth: Auth
  postService: PostsService
}

export class Monitoring extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: MonitoringConfigProps) {
    super(scope, id);

    /* Tools */

    // Creates a generic Metric
    function createMetric(namespace: string, metricName: string, label: string, statistic: string, dimensions: cloudwatch.DimensionHash) {
      const metric = new cloudwatch.Metric({
        metricName,
        namespace,
        statistic: statistic,
        period: cdk.Duration.minutes(1),
        dimensions
      });

      return metric;
    }

    // Creates a generic time series widget
    function createWidget(label: string, metrics: cloudwatch.IMetric[]) {
      const widget = new cloudwatch.GraphWidget({
        title: label,
        view: cloudwatch.GraphWidgetView.TIME_SERIES,
        liveData: true,
        left: metrics,
        leftYAxis: {
          showUnits: true
        }
      });
      return widget;
    }

    /* Create API usage custom metric */ 
    const apigwSearchMetric = new cloudwatch.MathExpression({
      expression: "SEARCH('{AWS/ApiGateway,ApiName,Method,Resource,Stage} (Method=\"GET\" OR Method=\"PUT\") AND MetricName=\"Count\"', 'SampleCount', 300)",
      usingMetrics: {}, //https://github.com/aws/aws-cdk/issues/7237
    });
    const apigwMathMetric = new cloudwatch.MathExpression({
      expression: "FILL(count, 0)",
      usingMetrics: { count: apigwSearchMetric },
      label: "Count"
    });
    const apigwWidget = new cloudwatch.GraphWidget({
      title: "API usage",
      view: cloudwatch.GraphWidgetView.TIME_SERIES,
      stacked: true,
      liveData: true,
      left: [apigwMathMetric],
      leftYAxis: {
        showUnits: true
      },
      height:12,
      width:12,
    });

    /* Business dashboard */
    const businessDashboard = new cloudwatch.Dashboard(this, "businessDashboard", {dashboardName: "BusinessDashboard"});
    businessDashboard.addWidgets(
      createWidget("Uploaded Pics", [createMetric("UnicornPics", "UploadedPics", "Uploads count", "SampleCount", {})]),
      createWidget("Likes", [createMetric("UnicornPics", "Likes", "Likes count", "SampleCount", {})]),
      apigwWidget,
      createWidget("Dislikes", [createMetric("UnicornPics", "Dislikes", "Dislikes count", "SampleCount", {})]),
      createWidget("SignUp", [createMetric("AWS/Cognito", "SignUpSuccesses", "SignUp count", "SampleCount", {UserPool: props.auth.userPool.userPoolId, UserPoolClient: props.auth.userPoolClient.userPoolClientId})]),
    );
    businessDashboard.addWidgets(
      createWidget("SignIn", [createMetric("AWS/Cognito", "SignInSuccesses", "SignIn count", "SampleCount", {UserPool: props.auth.userPool.userPoolId, UserPoolClient: props.auth.userPoolClient.userPoolClientId})]),
    );

    /* Technical dashboard */
    const technicalDashboard = new cloudwatch.Dashboard(this, "technicalDashboard", {dashboardName: "TechnicalDashboard"});
    technicalDashboard.addWidgets(
      createWidget("Lambda invocations", [createMetric("AWS/Lambda", "Invocations", "Invocations count", "SampleCount", {})]),
      createWidget("Lambda errors", [createMetric("AWS/Lambda", "Errors", "Errors count", "SampleCount", {})]),
      createWidget("Lambda durations", [createMetric("AWS/Lambda", "Duration", "Executions duration", "Average", {})]),      
      createWidget("Lambda throttles", [createMetric("AWS/Lambda", "Throttles", "Throttles count", "SampleCount", {})]),
      createWidget("API Gateway errors", [createMetric("AWS/ApiGateway", "5XXError", "Errors count", "SampleCount", {ApiName: "Posts Service"})]),
      createWidget("API Gateway latency", [createMetric("AWS/ApiGateway", "Latency", "Latency average", "Average", {ApiName: "Posts Service"})]),
      createWidget("API Gateway integration latency", [createMetric("AWS/ApiGateway", "IntegrationLatency", "Integration latency average", "Average", {ApiName: "Posts Service"})]),
      createWidget("DynamoDB Capacity Units usage", [
        createMetric("AWS/DynamoDB", "ConsumedReadCapacityUnits", "Used RCU count", "SampleCount", {TableName: props.postService.table.tableName}),
        createMetric("AWS/DynamoDB", "ConsumedWriteCapacityUnits", "Used WCU count", "SampleCount", {TableName: props.postService.table.tableName}) 
      ]),
    );
  }
}

