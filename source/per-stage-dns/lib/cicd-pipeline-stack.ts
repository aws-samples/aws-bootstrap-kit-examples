import { Stack, StackProps, Stage, StageProps, SecretValue, DefaultStackSynthesizer } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { config, SharedIniFileCredentials, Organizations, STS, CloudFormation, AWSError } from 'aws-sdk';
import {  PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { DNSInfrastructureStack } from "./dns-infrastructure-stack";

export class DNSInfrastructureStage extends Stage {
    constructor(scope: Construct, id: string, props: StageProps) {
        super(scope, id, props);
        new DNSInfrastructureStack(this, "DNS-Infrastructure", {...props, stageName: id.toLowerCase()});
    }
}

export class DNSInfrastructurePipelineStack extends Stack {
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
        commands: [`cd source/per-stage-dns`, 'npm install', 'npm run build','npx cdk synth'],
        primaryOutputDirectory: 'source/per-stage-dns/cdk.out',
        env: {
          NPM_CONFIG_UNSAFE_PERM: 'true',
        },
      }),
    });

    const AWS_PROFILE = 'cicd';
    if (!process.env.CODEBUILD_BUILD_ID) {
      config.credentials = new SharedIniFileCredentials({ profile: AWS_PROFILE });
    }

    const orgClient = new Organizations({ region: 'us-east-1' });
    orgClient
      .listAccounts()
      .promise()
      .then(async (results) => {
        let stagesDetails = [];
        if (results.Accounts) {
          for (const account of results.Accounts) {
            const tags = (await orgClient.listTagsForResource({ ResourceId: account.Id! }).promise()).Tags;
            if (tags && tags.length > 0) {
              const accountType = tags.find((tag) => tag.Key === 'AccountType')!.Value;
              if (accountType === 'STAGE') {
                const stageName = tags.find((tag) => tag.Key === 'StageName')!.Value;
                const stageOrder = tags.find((tag) => tag.Key === 'StageOrder')!.Value;
                stagesDetails.push({
                  name: stageName,
                  accountId: account.Id,
                  order: parseInt(stageOrder),
                });
              }
            }
          }
        }
        stagesDetails.sort((a, b) => (a.order > b.order ? 1 : -1));
        for (let stageDetailsIndex in stagesDetails) {
          let stageDetails = stagesDetails[stageDetailsIndex];
          pipeline.addStage(
            new DNSInfrastructureStage(this, stageDetails.name, { env: { account: stageDetails.accountId } })
          );
        }

        return stagesDetails.map((s) => s.accountId!);
      })
      .then(async (accountIds) => await this.CheckTargetEnvironments(accountIds, this.region, qualifier))
      .catch((error: AWSError) => {
        switch (error.code) {
          case 'CredentialsError': {
            console.error(
              '\x1b[31m',
              `Failed to get credentials for "${AWS_PROFILE}" profile. Make sure to run "aws configure sso --profile ${AWS_PROFILE} && aws sso login --profile ${AWS_PROFILE}"\n\n`
            );
            break;
          }
          case 'ExpiredTokenException': {
            console.error('\x1b[31m', `Token expired, run "aws sso login --profile ${AWS_PROFILE}"\n\n`);
            break;
          }
          case 'AccessDeniedException': {
            console.error(
              '\x1b[31m',
              `Unable to call the AWS Organizations ListAccounts API. Make sure to add a PolicyStatement with the organizations:ListAccounts action to your synth action`
            );
            break;
          }
          default: {
            console.error(error.message);
          }
        }
        //force CDK to fail in case of an unknown exception
        process.exit(1);
      });
  }

  private async CheckTargetEnvironments(accounts: Iterable<string>, region: string, qualifier: string): Promise<void> {
    const stsClient = new STS();

    for (const account of accounts) {
      console.log(`Checking whether the target environment aws://${account}/${region} is deployable...`);
      if (!(await this.checkTargetEnvironment(stsClient, account, region, qualifier))) {
        const message = `Account ${account} is not bootstrapped in ${region}. Make sure you deploy the pipeline in a deployable region.`;
        throw new Error(message);
      }
    }
  }

  private async checkTargetEnvironment(
    stsClient: STS,
    accountId: string,
    region: string,
    qualifier: string
  ): Promise<boolean> {
    try {
      const targetRoleArn = `arn:aws:iam::${accountId}:role/cdk-${qualifier}-deploy-role-${accountId}-${region}`;
      const assumedRole = await stsClient.assumeRole({ RoleArn: targetRoleArn, RoleSessionName: accountId }).promise();
      const cred = assumedRole.Credentials!;

      const targetAccountCredentials = {
        accessKeyId: cred.AccessKeyId,
        secretAccessKey: cred.SecretAccessKey,
        sessionToken: cred.SessionToken,
      };

      const cfnClient = new CloudFormation({ credentials: targetAccountCredentials });
      const stacks = await cfnClient.describeStacks({ StackName: 'CDKToolkit' }).promise();
      return stacks.Stacks![0].Parameters!.find((t) => t.ParameterKey == 'Qualifier')!.ParameterValue === qualifier;
    } catch (error) {
      console.log((error as Error).message);
      return false;
    }
  }
}
