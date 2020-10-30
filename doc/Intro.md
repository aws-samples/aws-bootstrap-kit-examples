# AWS Bootstrap Kit Overview

The AWS Bootstrap Kit is a strongly opinionated CDK set of constructs built for companies looking to follow AWS best practices on Day 1 while setting their development and deployment environment on AWS.

Let's start small but with potential for future growth without adding tech debt.

## What can I do with the AWS Bootstrap Kit?

The AWS Bootstrap Kit helps you with a few lines of CDK code to:
* secure your root user
* provision multiple AWS accounts
* define a hierarchy of accounts
* centralize your audit logs
* centralize your subdomain management.

Thanks to AWS Bootstrap Kit, you can follow AWS best practices on Day 1.

## How does the AWS Bootstrap Kit work?

The AWS Bootstrap Kit is based on AWS CDK, the AWS Cloud Development Kit, which is a software development framework for defining cloud infrastructure in code and provisioning it through AWS CloudFormation. 

With AWS CDK, you define your cloud resources in a familiar programming language. You don't need to learn the syntax of CloudFormation templates. The AWS CDK supports TypeScript, JavaScript, Python, Java, and C#/.Net. If you want to know more about CDK, please visit [AWS CDK documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html).

AWS CDK is based on the concept of construct. A construct represents an AWS resource or a set of AWS resources. A low-level construct directly maps to a CloudFormation resource while higher level of contruct can represent a set of resources that represents a pattern.

In addition, AWS CDK uses the concept of stack. It is the unit of deployment. All AWS resources defined within the scope of a stack, either directly or indirectly, are provisioned as a single unit. 

The AWS Bootstrap Kit provides you constructs that automate the following services in an opinionated way:
* [AWS Organizations](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html)
* [AWS CloudTrail for organizations](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/creating-trail-organization.html)
* [Amazon Route 53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html)
* [AWS Config](https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html)

In addition, it provides 2 stacks:
* AwsOrganizationsStack
* RootDNSStack

The **AwsOrganizationsStack** creates an organization that gathers all the AWS accounts you've required. It configures a CloudTrail for your organization to collect all audit logs in your main account. Finally, it enforces the security of your root user.

The **RootDNSStack** creates an Hosted Zone that will allow you to manage your subdomain centrally. Right now, it doesn't support the creation of a DNS domain. You must already own a DNS domain.

## Do I need to be familiar with the AWS Services used under the hood?

No, to set up your multi-account strategy with the AWS Bootstrap Kit, you don't need to be familiar with the AWS services used under the hood. The intent of the AWS Bootstrap Kit is helping you to start quickly, knowing that you are following AWS best practices and can grow further. Of course, over the time, you may need to learn about these services to fine tune your deployment but you don't need to start there.

## What are the prerequisites?

The AWS Bootstrap Kit requires:
* A [GitHub](https://github.com) account
* [npm](https://npmjs.org) and [awscli](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) installed
* A valid email (can be your root account one) 
  * without "+" in it
  * provided by a provider supporting [subaddressing](https://en.wikipedia.org/wiki/Plus_address) which means supporting '+' email extension (Most providers such as gmail/google, outlook etc. support it. If you're not sure check [this page](https://en.wikipedia.org/wiki/Comparison_of_webmail_providers#Features) "Address modifiers" column or send an email to yourself adding a plus extension such as `myname+test@myemaildomain.com` . if you receive it, you're good).   

## Where should I start?

The first thing you must deploy is the **AwsOrganizationsStack**. The SDLC organization example demonstrates how to deploy it easily. You can read how [here](https://github.com/aws-samples/aws-bootstrap-kit-examples/doc/sdlc-organization.md).

All other stacks and examples rely on an existing **AwsOrganizationsStack**.