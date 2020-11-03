import * as cdk from "@aws-cdk/core";
import * as cdkpipelines from "@aws-cdk/pipelines";
import * as awscodepipeline from '@aws-cdk/aws-codepipeline'; 
import * as awscodepipelineactions from '@aws-cdk/aws-codepipeline-actions';
import { LandingPageStack } from "./landing-page-stack";
import * as AWS from "aws-sdk";
import * as iam from "@aws-cdk/aws-iam"


export class LandingPageStage extends cdk.Stage {
    constructor(scope: cdk.Construct, id: string, props: cdk.StageProps) {
      super(scope, id, props);
  
      new LandingPageStack(this, 'LandingPageStack', props);
    }
  }

export class LandingPagePipelineStack extends cdk.Stack{
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const sourceArtifact = new awscodepipeline.Artifact();
        const cloudAssemblyArtifact = new awscodepipeline.Artifact();

        const pipeline = new cdkpipelines.CdkPipeline(this, "LandingPagePipeline",
            {
                sourceAction: new awscodepipelineactions.GitHubSourceAction(
                    {
                        actionName: "GitHub",
                        output: sourceArtifact,
                        owner: this.node.tryGetContext('github_alias'),
                        repo: this.node.tryGetContext('github_repo_name'),
                        branch: this.node.tryGetContext("github_repo_branch"),
                        oauthToken: cdk.SecretValue.secretsManager('GITHUB_TOKEN')
                    }
                ),
                synthAction: cdkpipelines.SimpleSynthAction.standardNpmSynth(
                    {
                        sourceArtifact,
                        cloudAssemblyArtifact,
                        subdirectory: 'source/3-landing-page/cdk',
                        installCommand: 'npm install'
                    }
                ),
                cloudAssemblyArtifact: cloudAssemblyArtifact
            });


        const AWS_PROFILE = 'cicd';
        if(!process.env.CODEBUILD_BUILD_ID) {
            AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: AWS_PROFILE});
        }
        

        const orgClient = new AWS.Organizations({region: 'us-east-1'});
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