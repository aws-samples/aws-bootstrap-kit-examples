import {
    Construct,
    Stack,
    StackProps,
    Stage,
    StageProps,
    SecretValue,
    CfnOutput
} from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import { Artifact } from "@aws-cdk/aws-codepipeline";
import {
    GitHubSourceAction,
} from "@aws-cdk/aws-codepipeline-actions";
import { config, SharedIniFileCredentials, Organizations } from "aws-sdk";
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { InfrastructureStack } from "./infrastructure-stack";

export class LandingPageStage extends Stage {
    constructor(scope: Construct, id: string, props: StageProps) {
        super(scope, id, props);
        new InfrastructureStack(this, "LandingPageStack", {...props, stage: id.toLowerCase()});
    }
}

export class LandingPagePipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const sourceArtifact = new Artifact();
        const cloudAssemblyArtifact = new Artifact();
        const oauth = SecretValue.secretsManager("GITHUB_TOKEN");

        const pipeline = new CdkPipeline(this, "LandingPagePipeline", {
            sourceAction: new GitHubSourceAction({
                actionName: "GitHub",
                output: sourceArtifact,
                owner: this.node.tryGetContext("github_alias"),
                repo: this.node.tryGetContext("github_repo_name"),
                branch: this.node.tryGetContext("github_repo_branch"),
                oauthToken: oauth,
            }),
            synthAction: SimpleSynthAction.standardNpmSynth({
                sourceArtifact,
                cloudAssemblyArtifact,
                // If we are using the mono repo examples then adding the proper prefix
                subdirectory: `${this.node.tryGetContext("github_repo_name") === 'aws-bootstrap-kit-examples' ? 'source/4-landing-page-with-feedback-api' : ''}infrastructure`,
                buildCommand: "npm run build:all",
                rolePolicyStatements: [
                    new PolicyStatement({
                        actions: [
                            "organizations:ListAccounts",
                            "organizations:ListTagsForResource"
                        ],
                        resources: ["*"],
                    }),
                ],
            }),
            cloudAssemblyArtifact: cloudAssemblyArtifact,
        });


        new CfnOutput(this, "PipelineConsoleUrl", {
            value: `https://${Stack.of(this).region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipeline.codePipeline.pipelineName}/view?region=${Stack.of(this).region}`,
        });

        const AWS_PROFILE = "cicd";
        if (!process.env.CODEBUILD_BUILD_ID) {
            config.credentials = new SharedIniFileCredentials({
                profile: AWS_PROFILE,
            });
        }

        const orgClient = new Organizations({ region: "us-east-1" });
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
                    pipeline.addApplicationStage(new LandingPageStage(this, stageDetails.name, {env: {account: stageDetails.accountId}}));
                }
            }
        ).catch((error) => {
                switch (error.code) {
                    case "CredentialsError": {
                        console.error(
                            "\x1b[31m",
                            `Failed to get credentials for "${AWS_PROFILE}" profile. Make sure to run "aws configure sso --profile ${AWS_PROFILE} && aws sso login --profile ${AWS_PROFILE} && npx cdk-sso-sync ${AWS_PROFILE}"\n\n`
                        );
                        break;
                    }
                    case "ExpiredTokenException": {
                        console.error(
                            "\x1b[31m",
                            `Token expired, run "aws sso login --profile ${AWS_PROFILE} && npx cdk-sso-sync ${AWS_PROFILE}"\n\n`
                        );
                        break;
                    }
                    case "AccessDeniedException": {
                        console.error(
                            "\x1b[31m",
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
}
