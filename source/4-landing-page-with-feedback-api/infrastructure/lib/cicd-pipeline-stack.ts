import {
    Stage,
    Stack,
    StackProps,
    StageProps,
    SecretValue,
    CfnOutput,
    DefaultStackSynthesizer,
  } from "aws-cdk-lib";
  import { Construct } from "constructs";
  import {
    CodePipeline,
    CodePipelineSource,
    ManualApprovalStep,
    ShellStep,
  } from "aws-cdk-lib/pipelines";
  import { InfrastructureStack } from "./infrastructure-stack";
  import { config, SharedIniFileCredentials, Organizations, AWSError } from "aws-sdk";
  import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
  
export class LandingPageStage extends Stage {
    constructor(scope: Construct, id: string, props: StageProps) {
      super(scope, id, props);
        new InfrastructureStack(this, "LandingPageStack", {...props, stage: id.toLowerCase()});
    }
  }
  
export class LandingPagePipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props);
  
      const qualifier = DefaultStackSynthesizer.DEFAULT_QUALIFIER;
  
      const source = CodePipelineSource.gitHub(
        `${this.node.tryGetContext('github_alias')}/${this.node.tryGetContext('github_repo_name')}`,
        this.node.tryGetContext('github_repo_branch'),
        {
          authentication: SecretValue.secretsManager('GITHUB_TOKEN'),
        }
      );
  
      const pipelineName = 'AWSBootstrapKit-LandingZone';
  
      const codePipelineRole = new Role(this, 'CodePipelineRole', {
        assumedBy: new ServicePrincipal('codepipeline.amazonaws.com'),
      });
      codePipelineRole.addToPolicy(
        new PolicyStatement({
          actions: ['organizations:ListAccounts', 'organizations:ListTagsForResource', 'cloudformation:DescribeStacks'],
          resources: ['*'],
        })
      );
      codePipelineRole.addToPolicy(
        new PolicyStatement({
          actions: ['sts:AssumeRole'],
          resources: [`arn:aws:iam::*:role/cdk-${qualifier}-deploy-role-*`],
        })
      );
      const pipeline = new CodePipeline(this, 'LandingPagePipeline', {
        pipelineName: pipelineName,
        crossAccountKeys: true,
        role: codePipelineRole,
  
        synth: new ShellStep('Synth', {
          input: source,
          commands: [`cd ${this.node.tryGetContext("github_repo_name") === 'aws-bootstrap-kit-examples' ? 'source/4-landing-page-with-feedback-api' : ''}infrastructure`, 'npm install', 'npm run build:all', 'npx cdk synth'],
          primaryOutputDirectory: `${this.node.tryGetContext("github_repo_name") === 'aws-bootstrap-kit-examples' ? 'source/4-landing-page-with-feedback-api' : ''}infrastructure/cdk.out`,
          env: {
            NPM_CONFIG_UNSAFE_PERM: 'true',
          },
        }),
      });
  
      const AWS_PROFILE = "cicd";
      if (!process.env.CODEBUILD_BUILD_ID) {
        config.credentials = new SharedIniFileCredentials({
          profile: AWS_PROFILE,
        });
      }
  
      (async () => {
        try {
          const orders: any = { Staging: 1, Prod: 2 };
          const orgs = new Organizations({ region: "us-east-1" });
          const { Accounts = [] } = await orgs.listAccounts().promise();
  
          Accounts.filter((account: any) => orders[account.Name!])
            .sort((a, b) => orders[a.Name!] - orders[b.Name!])
            .forEach((account: any) => {
              const infraStage = new LandingPageStage(this, account.Name!, {
                env: { account: account.Id },
              });
              const applicationStage = pipeline.addStage(infraStage);
  
              account.Name === "Prod" ?? applicationStage.addPre(new ManualApprovalStep("Approve"));
            });

            new CfnOutput(this, "PipelineConsoleUrl", {
                value: `https://${Stack.of(this).region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipeline.pipeline.pipelineName}/view?region=${Stack.of(this).region}`,
            });
        } catch (err) {
          const error = err as AWSError;
          const messages: any = {
            CredentialsError: `Failed to get credentials for "${AWS_PROFILE}" profile. Make sure to run "aws configure sso --profile ${AWS_PROFILE} && aws sso login --profile ${AWS_PROFILE}"\n\n`,
            ExpiredTokenException: `Token expired, run "aws sso login --profile ${AWS_PROFILE}"\n\n`,
            AccessDeniedException: `Unable to call the AWS Organizations ListAccounts API. Make sure to add a PolicyStatement with the organizations:ListAccounts action to your synth action`,
          };
          const message = messages[error.code];
          message
            ? console.error("\x1b[31m", message)
            : console.error(error.message);
  
          process.exit(1); //force CDK to fail in case of an unknown exception
        }
      })();
    }
  }
