# Welcome to the Landing Page with Pipeline CDK app example

As described in root [README](../../README.md), this [CDK](https://docs.aws.amazon.com/cdk/latest/guide/apps.html) app is an improvement of the [Landing Page CDK app](../2-landing-page/README.md). The example demonstrates how to add a CI/CD pipeline to the app to deploy the static web site on the staging and prod environments (basically the Staging and Prod account) created by the [SDLC Organization CDK app](../1-SDLC-organization/README.md).

## Under the hood

This CDK app adds a new stack, the **LandingPagePipelineStack**, which deploys a CI/CD pipeline orchestrating the deployment of your static web site accross several environments (and thus several AWS accounts as we follow the best practice 1 environment = 1 AWS account).

The **LandingPagePipelineStack** instanciates the following resources:
* An S3 Bucket to store your build assets
* A CodePipeline pipeline to orchestrate the build and deployment of the LandingPageStack accross the Staging and Prod accounts

The CDK application source code is in the `source\3-landing-page-cicd\cdk` folder.

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

### Configure a profile with appropriate permissions to deploy a pipeline in the CICD account

If you followed the whole [SDLC Organization CDK app](../1-SDLC-organization/README.md) setup procedure, you have created a user group called **DevOpsEngineers** and you gave it the permission to access the CICD account with the **DevOpsAccess** permission set. If you don't have followed these steps, please run them now as the following steps are based on it.

Right now, the *Developer* user that you are using has no access to the CICD account as it is only member of the *Developers* group. Let's add it to the **DevOpsEngineers** group to give it access to the CICD account with the appropriate permissions.

1. Navigate to your SSO portal Url and sign in with your administrator user

    ![SSO portal sign in page with administrator filled in the username field and some masked characters in the password field](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-1.png)

1. Click on the AWS Account card

    ![The home page of the SSO portal with the AWS Account card](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-2.png)

1. Click on the the main account row to expand it

    ![The home page of the SSO portal with the AWS Account card and the list of account expanded](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-3.png)

1. Click on the *Management console* link for the **AdministratorAccess** permission set

    ![The home page of the SSO portal with the AWS Account card and the list of account expanded and the list of permission set for the main account expanded](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-4.png)

1. Seach for the AWS SSO service thanks to the Find Services field

    ![The AWS Console home page with SSO entered in the Find Services field](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-5.png)

1. Click on Users on the left side menu

    ![The AWS SSO Console home page](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-6.png)

1. Click on the Developer user

    ![The AWS SSO Console Users page with the list of SSO users](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-7.png)

1. Click on the Groups tab

    ![The AWS SSO Console Users details page for the Developer user](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-8.png)

1. Select the **DevOpsEngineers** group and click on the *Add to 1 group(s)* button

    ![The AWS SSO Console Add user to groups page with the list of available groups](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-10.png)

1. Go back to your SSO portal and click on *Sign out*

    ![The home page of the SSO portal](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-11.png)

1. Execute `aws configure sso --profile cicd` and follow the instructions

1. When you are asked to sign in in a web browser, use your Developer credentials

    ![SSO portal sign in page with Developer filled in the username field and some masked characters in the password field](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-13.png)

1. Click on the *Sign in to AWS CLI* button

    ![SSO portal sign in page for the AWS CLI sign in](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-14.png)

1. You can close your browser

    ![SSO portal sign in page for the AWS CLI sign in with a confirmation message](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-15.png)

1. Go back to your shell and select the CICD account

    ![A shell interface with the aws configure sso --profile cicd command running and waiting for the account selection](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-16.png)

1. Enter the default region where you want to deploy, e.g. eu-west-1, and your default output format, e.g. json

    ![A shell interface with the aws configure sso --profile cicd command running](../../doc/landing-page-with-cicd-add-to-devopsengineers-group-17.png)

1. Execute `npm install -g cdk-sso-sync`

    > Right now the cdk cli is not SSO friendly so we use a small command line tool to synchronize SSO credential with standard aws cli credential so that cdk can use a SSO profile

1. Execute `cdk-sso-sync cicd`

### Create a secret with your GitHub Personal Access Token in the CICD account

When you have gone through the [SDLC Organization CDK app](../1-SDLC-organization/README.md) setup procedure, you have created a secret in AWS Secrets Manager in your main account to store your GitHub Personal Access Token. The secret is only accessible from the main account.

Now, we have to create the same secret in the *CICD* account so that the CodePipeline service can access the source code in your GitHub repository.

```
aws --profile cicd secretsmanager create-secret --name GITHUB_TOKEN --secret-string <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>
```

### Update the cdk.json file parameters

1. You must update the following values in your *source/3-landing-page-with-cicd/cdk/cdk.json* file:

    * "github_alias": <YOUR_GITHUB_ALIAS>
    * "github_repo_name": <YOUR_GITHUB_REPOSITORY>,
    * "github_repo_branch": <YOUR_GITHUB_BRANCH>


### Install dependencies

1. Go to the *3-landing-page-cicd* folder

    ```
    cd source/3-landing-page-cicd/cdk
    ```

1. Install dependencies

    ```
    npm install
    ```

### Deploy the **LandingPagePipelineStack**

1. Build the CDK application
    ```
    npm run build
    ```

1. Deploy default stack of the CDK application, the **LandingPagePipelineStack** one.
    ```
    cdk deploy --profile cicd
    ```

### Destroy the **LandingPagePipelineStack**

You can easily destroy the **LandingPagePipelineStack** and free up the deployed AWS resources on the CICD account:

```
cdk destroy --profile cicd
```

> Deleting the pipeline stack doesn't delete the **LandingPageStack** from the Staging and Prod accounts. You have to delete them manually whether through the AWS CloudFormation console or the AWS CLI.


### Troubleshooting

* If you get an CloudFormation Internal Failure error while deploying the stack, please check you have properly created the GITHUB_TOKEN secret
* If you get an error 400 message as a detailed error message when CodeBuild fails, please check you have properly modify your cdk.json file
* If you get an error message stating *Cannot have more thant 1 builds in queue for the account* as a detailed error message when CodeBuild fails, please retry the step in CodePipeline. You are reaching a limit due to the fact that your AWS account is new. You can make a support request to increase the limit.