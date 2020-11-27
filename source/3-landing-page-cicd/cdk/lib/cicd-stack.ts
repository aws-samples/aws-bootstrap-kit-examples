import { Construct, Stack, StackProps, Stage, StageProps, SecretValue } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import { Artifact } from '@aws-cdk/aws-codepipeline';
import { GitHubSourceAction } from '@aws-cdk/aws-codepipeline-actions';
import { LandingPageStack } from "./landing-page-stack";
import { config, SharedIniFileCredentials, Organizations } from "aws-sdk";
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
                                actions: ['organizations:ListAccounts'],
                                resources: ['*'],
                            }),
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
            results => {
                let stagesDetails = [];
                if(results.Accounts) {
                    for (const account of results.Accounts) {
                        switch(account.Name) {
                            case 'Staging': {
                                stagesDetails.push({
                                    name: account.Name,
                                    accountId: account.Id,
                                    order: 1
                                });
                                break;
                            }
                            case 'Prod': {
                                stagesDetails.push({
                                    name: account.Name,
                                    accountId: account.Id,
                                    order: 2
                                });
                                break;
                            }
                            default: {
                                console.log(`Ignoring stage ${account.Name}`);
                                break;
                            }
                        }
                    }
                }
                stagesDetails.sort((a,b) => (a.order > b.order)?1:-1);
                for (let stageDetailsIndex in stagesDetails) {
                    let stageDetails = stagesDetails[stageDetailsIndex];
                    pipeline.addApplicationStage(new LandingPageStage(this, stageDetails.name, {env: {account: stageDetails.accountId}}));
                }
            }
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
}
