import { Construct, Stack, StackProps, CfnOutput, Tags } from '@aws-cdk/core';
import { SurveyServiceStack } from "./surveyService/survey-service-stack";
import { FrontendStack } from "./frontend/frontend-stack";
import { FrontendConfig } from "../lib/frontend/frontend-config";

export interface InfrastructureStackProps extends StackProps {
  stage?: string;
}

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props);

    Tags.of(this).add('ServiceName', 'LandingPage');

    // Deploy Website Hosting infrastructure
    const frontend = new FrontendStack(this, "FrontendStack", {
      rootDomain: this.node.tryGetContext("domain_name"),
      serviceName: this.node.tryGetContext("service_name"),
      stage: props.stage
    });

    // Deploy SurveyService infrastructure
    const surveyService = new SurveyServiceStack(this, "SurveyServiceStack", {
        siteDistributionDomainName: frontend.frontendUrl,
    });

    // Deploy Website config linking surveyService to your Website
    const frontendConfig = new FrontendConfig(this, 'FrontendConfig', {
        siteBucket: frontend.siteBucket,
        api: surveyService.api
    });

    // Display Website exposed URL
    new CfnOutput(this, 'FrontendUrl', {
        value: `https://${frontend.frontendUrl}`,
    });

    // Display API URL
    new CfnOutput(this, 'configJSON', {
      value: frontendConfig.config,
    });
    
  }
}