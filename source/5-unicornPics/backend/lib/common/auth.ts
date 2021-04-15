import * as cdk from '@aws-cdk/core';
import * as cognito from "@aws-cdk/aws-cognito";

export class Auth extends cdk.Construct {
  public userPool: cognito.UserPool;
  public userPoolClient: cognito.UserPoolClient;

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

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
    });

    this.userPoolClient = this.userPool.addClient('activate-app-client');

    new cdk.CfnOutput(this, "UserPoolId", { value: this.userPool.userPoolId, exportName: "UserPoolId" });
    new cdk.CfnOutput(this, "UserPoolClientId", { value: this.userPoolClient.userPoolClientId, exportName: "UserPoolClientId" });
  }
}