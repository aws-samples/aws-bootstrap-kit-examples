import { Construct, Stack, StackProps, Stage, StageProps, SecretValue, DefaultStackSynthesizer } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import { Artifact } from '@aws-cdk/aws-codepipeline';
import { GitHubSourceAction } from '@aws-cdk/aws-codepipeline-actions';
import { LandingPageStack } from "./landing-page-stack";
import { config, SharedIniFileCredentials, Organizations, STS, CloudFormation } from "aws-sdk";
import { PolicyStatement } from "@aws-cdk/aws-iam"

export class LandingPageStage extends Stage {
    constructor(scope: Construct, id: string, props: StageProps) {
        super(scope, id, props);

        new LandingPageStack(this, 'LandingPageStack', {...props, stage: id.toLowerCase()});
    }
}

export class LandingPagePipelineStack extends Stack{

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const qualifier = DefaultStackSynthesizer.DEFAULT_QUALIFIER;

        const sourceArtifact = new Artifact();
        const cloudAssemblyArtifact = new Artifact();

        const pipeline = new CdkPipeline(this, "LandingPagePipeline",
            {
                sourceAction: new GitHubSourceAction(
                    {
                        actionName: "GitHub",
                        output: sourceArtifact,
                        owner: this.node.tryGetContext('github_alias'),
                        repo: this.node.tryGetContext('github_repo_name'),
                        branch: this.node.tryGetContext("github_repo_branch"),
                        oauthToken: SecretValue.secretsManager('GITHUB_TOKEN')
                    }
                ),
                synthAction: SimpleSynthAction.standardNpmSynth(
                    {
                        sourceArtifact,
                        cloudAssemblyArtifact,
                        subdirectory: 'source/3-landing-page-cicd/cdk',
                        installCommand: 'npm install',
                        rolePolicyStatements: [
                            new PolicyStatement({
                                actions: [
                                    'organizations:ListAccounts',
                                    "organizations:ListTagsForResource",
                                    "cloudformation:DescribeStacks"
                                ],
                                resources: ['*'],
                            }),
                            new PolicyStatement({
                                actions: ["sts:AssumeRole"],
                                resources: [`arn:aws:iam::*:role/cdk-${qualifier}-deploy-role-*`]
                            })
                        ],
                    }
                ),
                cloudAssemblyArtifact: cloudAssemblyArtifact
            });


        const AWS_PROFILE = 'cicd';
        if(!process.env.CODEBUILD_BUILD_ID) {
            config.credentials = new SharedIniFileCredentials({profile: AWS_PROFILE});
        }

        const orgClient = new Organizations({region: 'us-east-1'});
        orgClient.listAccounts().promise().then(
            async results => {
                let stagesDetails = [];
                if(results.Accounts) {
                    for (const account of results.Accounts) {
                        const tags = (await orgClient.listTagsForResource({ResourceId: account.Id!}).promise()).Tags;
                        if(tags && tags.length > 0){
                            const accountType = tags.find(tag => tag.Key === 'AccountType')!.Value;
                            if ( accountType === 'STAGE' ) {
                                const stageName = tags.find(tag => tag.Key === 'StageName')!.Value;
                                const stageOrder = tags.find(tag => tag.Key === 'StageOrder')!.Value;
                                stagesDetails.push({
                                    name: stageName,
                                    accountId: account.Id,
                                    order: parseInt(stageOrder)
                                });
                            }
                        }
                    }
                }
                stagesDetails.sort((a,b) => (a.order > b.order)?1:-1);
                for (let stageDetailsIndex in stagesDetails) {
                    let stageDetails = stagesDetails[stageDetailsIndex];
                    pipeline.addApplicationStage(new LandingPageStage(this, stageDetails.name, { env: { account: stageDetails.accountId } }));
                }

                return stagesDetails.map(s => s.accountId!);
            }
        ).then(
            async accountIds => await this.CheckTargetEnvironments(accountIds, this.region, qualifier)
        ).catch(
            (error) => {
                switch (error.code) {
                    case 'CredentialsError': {
                        console.error("\x1b[31m", `Failed to get credentials for "${AWS_PROFILE}" profile. Make sure to run "aws configure sso --profile ${AWS_PROFILE} && aws sso login --profile ${AWS_PROFILE}"\n\n`);
                        break;
                    }
                    case 'ExpiredTokenException': {
                        console.error("\x1b[31m", `Token expired, run "aws sso login --profile ${AWS_PROFILE}"\n\n`);
                        break;
                    }
                    case 'AccessDeniedException': {
                        console.error("\x1b[31m", `Unable to call the AWS Organizations ListAccounts API. Make sure to add a PolicyStatement with the organizations:ListAccounts action to your synth action`);
                        break;
                    }
                    default: {
                        console.error(error.message);
                    }
                }
                //force CDK to fail in case of an unknown exception
                process.exit(1);
            }
        )
    }

    private async CheckTargetEnvironments(accounts: Iterable<string>, region: string, qualifier: string) : Promise<void> {
        var stsClient = new STS();

        for (const account of accounts) {
            console.log(`Checking whether the target environment aws://${account}/${region} is deployable...`);
            if (!await this.checkTargetEnvironment(stsClient, account, region, qualifier)) {
                var message = `Account ${account} is not bootstrapped in ${region}. Make sure you deploy the pipeline in a deployable region.`;
                throw new Error(message);
            }
        }
    }

    private async checkTargetEnvironment(stsClient: STS, accountId: string, region: string, qualifier: string): Promise<boolean> {
        try {
            const targetRoleArn = `arn:aws:iam::${accountId}:role/cdk-${qualifier}-deploy-role-${accountId}-${region}`;
            const assumedRole = await stsClient.assumeRole({ RoleArn: targetRoleArn, RoleSessionName: accountId }).promise();
            const cred = assumedRole.Credentials!;

            const targetAccountCredentials = {
                accessKeyId: cred.AccessKeyId,
                secretAccessKey: cred.SecretAccessKey,
                sessionToken: cred.SessionToken
            };

            const cfnClient = new CloudFormation({ credentials: targetAccountCredentials });
            const stacks = await cfnClient.describeStacks({ StackName: 'CDKToolkit' }).promise();
            return stacks.Stacks![0].Parameters!.find(t => t.ParameterKey == 'Qualifier')!.ParameterValue === qualifier;
        } catch (error) {
            console.log((error as Error).message);
            return false;
        }
    }
}
