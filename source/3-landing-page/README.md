# Welcome to the Landing Page CDK app

As described in root [README](../../README.md), this [CDK](https://docs.aws.amazon.com/cdk/latest/guide/apps.html) app strive to deploy a static web site on top of the resources created by the [SDLC Organization CDK app](../1-SDLC-organization/README.md). Especially, it leverages the CICD, Dev, Staging and Prod accounts to deploy the application into several environments.

## Under the hood

This CDK app comes with 2 main stacks:
* The **LandingPageStack** which is the stack deploying your static web site and the required related AWS resources
* The **LandingPagePipelineStack** which is stack deploying the CI/CD pipeline orchestrating the deployment of your static web site accross several environments (and thus several AWS accounts as we follow the best practice 1 environment = 1 AWS account).

The **LandingPageStack** instanciates the following resources:
* An S3 Bucket configured to host a static web site with public access blocked
* A CloudFront Distribution
* An Origin Access Identity that allows CloudFront to access and serve the content of the S3 Bucket

The **LandingPagePipelineStack** instanciates the following resources:
* An S3 Bucket to store your build assets
* A CodePipeline pipeline to orchestrate the build and deployment of the LandingPageStack accross the Staging and Prod accounts

The CDK application source code is in the `source\3-landing-page\cdk` folder.

The **LandingPageStack** assumes that the content of your static web site is stored in the `source\3-landing-page\www` folder. Right now, it is a basic index.html file but it could be a more sophisticated static web site containing image, css and js files among others.


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

1. Go to the SDLC Organization folder

    ```
    cd source/3-landing-page/cdk
    ```

1. Install dependencies

    ```
    npm install
    ```

### Deploy **LandingPageStack**

You can deploy the **LandingPageStack** to test the static web site into your developer environment (the Dev account).

1. Build the CDK application
    ```
    npm run build
    ```

2. Deploy the *LandingPageStack* by deploying directly the *LandingPageStage* to the Dev account
    ```
    cdk deploy --profile <profile-with-access-to-Dev-account> -a cdk.out/assembly-LandingPageStage
    ```

### Destroy **LandingPageStack**

You can easily destroy the **LandingPageStack** and free up the deployed AWS resources on the Dev account:
```
cdk destroy --profile <profile-with-access-to-Dev-account> -a cdk.out/assembly-LandingPageStage
```

### Deploy the pipeline that deploys **LandingPageStack** on Staging and Prod accounts

1. Before deploying the pipeline stack, configure a profile called *cicd* with the credentials of user having *DevOpsEngineerAccess* to your *CICD* account.

    > The name of the profile is **important**. The code of the example looks for this profile name and will fail if it doesn't find it.

    ```
    aws configure --profile cicd
    ```

1. Then, create a secret in Secrets Manager in the CICD account to store your GitHub PAT with `admin:repo_hook` full control and `repo` full control:
    ```
    aws --profile cicd secretsmanager create-secret --name GITHUB_TOKEN --secret-string <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>
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


### Deploy the pipeline that deploys **LandingPageStack** on Staging and Prod accounts

You can easily destroy the **LandingPagePipelineStack** and free up the deployed AWS resources on the CICD account:

```
cdk destroy --profile <profile-with-access-to-CICD-account>
```

> Deleting the pipeline stack doesn't delete the **LandingPageStack** from the Staging and Prod accounts. You have to delete them manually whether through the AWS CloudFormation console or the AWS CLI.

