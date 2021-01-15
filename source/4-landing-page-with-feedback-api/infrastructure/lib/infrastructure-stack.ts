import { Construct, Stack, StackProps, CfnOutput, Tags } from '@aws-cdk/core';
import { SurveyServiceStack } from "./surveyService/survey-service-stack";
import { FrontendStack } from "./frontend/frontend-stack";
import { FrontendConfig } from "../lib/frontend/frontend-config";

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    Tags.of(this).add('ServiceName', 'LandingPage');

    // Deploy Website Hosting infrastructure
    const frontend = new FrontendStack(this, "FrontendStack");

    // Deploy SurveyService infrastructure
    const surveyService = new SurveyServiceStack(this, "SurveyServiceStack", {
        siteDistributionDomainName: frontend.distribution.distributionDomainName,
    });

    // Deploy Website config linking surveyService to your Website
    new FrontendConfig(this, 'FrontendConfig', {
        siteBucket: frontend.siteBucket,
        api: surveyService.api
    });

    // Display Website exposed URL
    new CfnOutput(this, 'DistributionDomainName', {
        value: frontend.distribution.distributionDomainName,
    });
    
  }
}