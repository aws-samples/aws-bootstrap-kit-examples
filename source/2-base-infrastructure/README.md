# Base Infrastructure CDK App

This package works on top of *Software Developement Landing Zone* one and will setup the basis of your infrastucture such as centralized DNS.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## Usage

1. Bootstrap CICD account
        ```
        cdk --profile=ilmlf-cicd bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
        aws --profile=ilmlf-cicd secretsmanager create-secret --name GITHUB_TOKEN --secret-string <GITHUB TOKEN>
        ```
1. Bootstrap All other accounts
  1. DNS
        ```
        cdk --profile=ilmlf-cicd bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
        --trust 377591626254 \
        aws://939354439711/eu-west-1
        ```


## TODO

Move use cases to integration tests using https://github.com/aws/aws-cdk/issues/601#issuecomment-499636828 to control the deploy of the stack