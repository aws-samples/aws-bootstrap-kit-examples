# Welcome to the Landing Page with Pipeline CDK app example

As described in root [README](../../README.md), this [CDK](https://docs.aws.amazon.com/cdk/latest/guide/apps.html) app is an improvement of the [Landing Page CDK app](../2-landing-page/README.md). The example demonstrates how to add a CI/CD pipeline to the app to deploy the static web site on the staging and prod environments (basically the Staging and Prod account) created by the [SDLC Organization CDK app](../1-SDLC-organization/README.md).

## Under the hood

This CDK app adds a new stack, the **LandingPagePipelineStack**, which deploys a CI/CD pipeline orchestrating the deployment of your static web site accross several environments (and thus several AWS accounts as we follow the best practice 1 environment = 1 AWS account).

The **LandingPagePipelineStack** instanciates the following resources:
* An S3 Bucket to store your build assets
* A CodePipeline pipeline to orchestrate the build and deployment of the LandingPageStack accross the Staging and Prod accounts

The CDK application source code is in the `source\3-landing-page\cdk` folder.

## Deployments

### Prerequisites

* A [GitHub](https://github.com) account
* [npm](https://npmjs.org) and [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) installed
* A SDLC Organization deployed with the [SDLC Organization CDK app](../1-SDLC-organization/README.md)

### Fork and clone the repository

1. Fork the repository on your GitHub account by clicking [here](https://github.com/aws-samples/aws-bootstrap-kit-examples/fork).

2. Clone the repository locally:
    ```
    git clone https://github.com/<YOUR_GITHUB_ALIAS>/aws-bootstrap-kit-examples
    ```

### Install dependencies

1. Go to the *3-landing-page* folder

    ```
    cd source/3-landing-page/cdk
    ```

1. Install dependencies

    ```
    npm install
    ```

### Deploy the **LandingPagePipelineStack**

1. Before deploying the pipeline stack, configure a profile called *cicd* with the credentials of a user having *DevOpsEngineerAccess* to your *CICD* account.

    > The name of the profile is **important**. The code of the example looks for this profile name and will fail if it doesn't find it.

    ```
    aws configure --profile cicd
    ```

1. Build the CDK application
    ```
    npm run build
    ```

1. Deploy default stack of the CDK application, the **LandingPagePipelineStack** one.
    ```
    cdk deploy --profile cicd
    ```

    > You must update the following values in your cdk.json file:
    >
    >* "github_alias": <YOUR_GITHUB_ALIAS>
    >* "github_repo_name": <YOUR_GITHUB_REPOSITORY>,
    >* "github_repo_branch": <YOUR_GITHUB_BRANCH>

    > It is important that a secret named GITHUB_TOKEN exists in Secrets Manager in your CICD account. You should already have created it while deploying the [SDLC Organization CDK app](../1-SDLC-organization/README.md).


### Destroy the **LandingPagePipelineStack**

You can easily destroy the **LandingPagePipelineStack** and free up the deployed AWS resources on the CICD account:

```
cdk destroy --profile cicd
```

> Deleting the pipeline stack doesn't delete the **LandingPageStack** from the Staging and Prod accounts. You have to delete them manually whether through the AWS CloudFormation console or the AWS CLI.

