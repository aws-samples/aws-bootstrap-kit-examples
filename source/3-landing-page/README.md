# Welcome to the Landing Page CDK app

As described in root [README](../../README.md), this [CDK](https://docs.aws.amazon.com/cdk/latest/guide/apps.html) app strive to deploy a static web site on top of the resources created by the [SDLC Organization CDK app](../1-SDLC-organization/README.md).

## Under the hood

This CDK app will instanciate the following resources:
* an S3 Bucket configured to host a static web site with public access blocked
* a CloudFront Distribution
* an Origin Access Identity that allows CloudFront to access and serve the content of the S3 Bucket

## Deployments

### Prerequisites

* A [GitHub](https://github.com) account
* [npm](https://npmjs.org) and [awscli](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) installed
* A SDLC Organization deployed with the [SDLC Organization CDK app](../1-SDLC-organization/README.md)

### Install dependencies

1. Go to the SDLC Organization folder

    ```
    cd source/3-landing-page
    ```

1. Install dependencies

    ```
    npm install
    ```

### Deploy the Stack

```
npm run build
cdk deploy --profile <profile-with-access-to-Dev-account> -a cdk.out/assembly-LandingPageStage
```

### Destroy the Stack

```
cdk destroy --profile <profile-with-access-to-Dev-account> -a cdk.out/assembly-LandingPageStage
```

### Deploy the pipeline that deploys the stack on Staging and Prod accounts

```
npm run build
aws --profile <profile-with-access-to-CICD-account> secretsmanager create-secret --name GITHUB_TOKEN --secret-string <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>
cdk deploy --profile <profile-with-access-to-CICD-account>
```

> If you've forked the aws-bootstrap-kit-examples, you shoud update the following values in your cdk.json file:
>
>* "github_alias": <YOUR_GITHUB_ALIAS>
>* "github_repo_name": <YOUR_GITHUB_REPOSITORY>,
>* "github_repo_branch": <YOUR_GITHUB_BRANCH>

### Deploy the pipeline that deploys the stack on Staging and Prod accounts

```
cdk destroy --profile <profile-with-access-to-CICD-account>
```


