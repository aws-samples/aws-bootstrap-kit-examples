import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apiGateway from "@aws-cdk/aws-apigateway";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import { Code, Runtime } from "@aws-cdk/aws-lambda";
import { TableEncryption } from "@aws-cdk/aws-dynamodb";
import { RemovalPolicy, CfnOutput } from "@aws-cdk/core";


interface SurveyServiceStackProps extends cdk.NestedStackProps {
    siteDistributionDomainName: string;
}

export class SurveyServiceStack extends cdk.NestedStack {
  public readonly api: apiGateway.RestApi;

  constructor(scope: cdk.Construct, id: string, props: SurveyServiceStackProps) {
    super(scope, id);

    const tableName = `Feedbacks-${this.node.addr}`;

    this.api = new apiGateway.RestApi(this, "LandingPageAPI", {
        restApiName: "Landing Page API",
        description: "Handles the request from the landing page.",
    });

    const landingPageTable = new dynamo.Table(this, "Feedbacks", {
        tableName: tableName,
        encryption: TableEncryption.AWS_MANAGED,
        partitionKey: { name: "Key", type: dynamo.AttributeType.STRING },
        removalPolicy: RemovalPolicy.DESTROY,
    });

    const handler = new lambda.Function(this, "LandingPageForm", {
        runtime: Runtime.NODEJS_12_X,
        code: Code.fromAsset(`${__dirname}/lambda`),
        handler: "index.handler",
        environment: {
            TABLE_NAME: tableName,
            Access_Control_Allow_Origin: `https://${props.siteDistributionDomainName}`,
        },
    });

    landingPageTable.grantWriteData(handler);

    const lambdaIntegration = new apiGateway.LambdaIntegration(handler, {
        requestTemplates: { "application/json": '{ "statusCode": "200" }' },
    });

    const feedback = this.api.root.addResource("feedback");

    feedback.addMethod("POST", lambdaIntegration);
  }
}
