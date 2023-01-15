import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';

export class Auth extends Construct {
  public userPool: cognito.UserPool;
  public userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    //preSignUp lambda to be added to Cognito User Pool to avoid email sending to virtual users
    const preSignUp = new lambda.NodejsFunction(this, 'preSignUp');

    // create Cognito user pool
    this.userPool = new cognito.UserPool(this, "activatePool", {
      userPoolName: "activate-userpool",
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: "Verify your email for our Activate app!",
        emailBody:
          "Hello {username}, Thanks for signing up to our Activate app! Your verification code is {####}",
        emailStyle: cognito.VerificationEmailStyle.CODE,
        smsMessage:
          "Hello {username}, Thanks for signing up to our Activate app! Your verification code is {####}",
      },
      signInAliases: {
        username: true,
        email: true,
      },
      lambdaTriggers: {
        preSignUp: preSignUp,
      }
    });

    this.userPoolClient = this.userPool.addClient('activate-app-client', {
      authFlows: {
        adminUserPassword: true,
        userSrp: true,
      }
    });

    new cdk.CfnOutput(this, "UserPoolId", { value: this.userPool.userPoolId, exportName: "UserPoolId" });
    new cdk.CfnOutput(this, "UserPoolClientId", { value: this.userPoolClient.userPoolClientId, exportName: "UserPoolClientId" });
  }
}