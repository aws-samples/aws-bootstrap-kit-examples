# Per stage DNS domain deployment pipeline

Assuming you own several domains dedicated to each of your stages (dev-mycompany.com, qa-mycompany.com ...) and you want easily delegate their management to your respective stage account's AWS Route53.

This example is a simple CDK app enabling to create the public hosted zones in each account.


## Usage

### 1. Configure your stage mapping

1. Add your mapping in your cdk.json. For instance:
    ```
    {
    "app": "npx ts-node --prefer-ts-exts bin/per-stage-dns.ts",
    "context": {
        "@aws-cdk/core:enableStackNameDuplicates": "true",
        "aws-cdk:enableDiffNoFail": "true",
        "@aws-cdk/core:stackRelativeExports": "true",
        "@aws-cdk/aws-ecr-assets:dockerIgnoreSupport": true,
        "@aws-cdk/aws-secretsmanager:parseOwnedSecretName": true,
        "@aws-cdk/core:newStyleStackSynthesis": true,
        "@aws-cdk/aws-kms:defaultKeyPolicies": true,
        "@aws-cdk/aws-s3:grantWriteWithoutAcl": true,
        "github_alias": "flochaz",
        "github_repo_name": "aws-bootstrap-kit-examples",
        "github_repo_branch": "main",
        "stageDomainMapping": {
        "dev": "dev-mycompany.com",
        "qa": "staging-mycompany.com",
        "prod": "prod-mycompany.com"
        }
    }
    }
    ```

    `dev`, `qa` and `prod` stageDomainMapping attributes key correspond to the stageName set in `source/1-SDLC-organization/bin/sdlc-organization.ts` .

1. Commit and push your changes
    ```
    git add cdk.json
    git commit -m "configure mapping and github source"
    git push
    ```



### 2. Test it in dev

1. Build and Deploy
    ```
    npm ci
    npm run build
    npm run cdk deploy DNS-Infrastructure --  --profile dev
    ```

1. Delegate this dev domain to route53
    Go to your DNS provider and copy the NS records you got from previous command (`ns-1234.awsdns-56.org`, `ns-789.awsdns-01.com`, `ns-2345.awsdns-67.co.uk`, `ns-890.awsdns-12.net` in the following example)
    ```
    ✅  DevStageDnsStack

    Outputs:
    DevStageDnsStack.NSrecords = ns-1234.awsdns-56.org,ns-789.awsdns-01.com,ns-2345.awsdns-67.co.uk,ns-890.awsdns-12.net
    ```

1. Test the resolution with dig
    ```
    dig dev-mydomain.com NS
    ...
    ;; ANSWER SECTION:
    dev-mydomain.com. 300 IN NS ns-1234.awsdns-56.org.
    dev-mydomain.com. 300 IN NS ns-789.awsdns-01.com.
    dev-mydomain.com. 300 IN NS ns-2345.awsdns-67.co.uk.
    dev-mydomain.com. 300 IN NS ns-890.awsdns-12.net.
    ...
    ```


### 3. Deploy to stages through pipeline

1. Build and Deploy the pipeline
    ```
    npm run cdk deploy DNS-Pipeline --  --profile cicd
    ```
1. Delegate this dev domain to route53
    Go to your DNS provider and copy the NS records you got from 
        
    * your different deployed stack in each environment by going to SSO Login page > Staging or Prod Account ReadOnly access > AWS Console > Cloud Formation > DNS-Infrastructure > Outputs > NSrecords 
    
    * or running this command against each stage (if you configured your aws profile properly, `prod` is the one use in this example): `aws cloudformation describe-stacks --stack-name DNS-Infrastructure --query "Stacks[0].Outputs[?OutputKey=='NSrecords'].OutputValue" --output text --profile prod`

1. Test the resolution with dig


### 4. Use those domain in your app

1. You will need the coresponding zone id so we suggest that you create the same kind of mapping done in this app `cdk.json` but with the coresponding zoneId:
    1. Get the zoneId from the different stages:
        * your different deployed stack in each environment by going to SSO Login page > Staging or Prod Account ReadOnly access > AWS Console > Cloud Formation > DNS-Infrastructure > Outputs > HostedZoneId
        * running this command for dev
        ```
        aws cloudformation describe-stacks --stack-name DNS-Infrastructure --query "Stacks[0].Outputs[?OutputKey=='HostedZoneId'].OutputValue" --output text --profile dev
        ```
    1. Add the mapping to your context:
        ```
        cat ${MY_APP_ROOT_FOLDER}/cdk.json
        {
        "app": "npx ts-node --prefer-ts-exts bin/my-web-app.ts",
            "context": {
                ...
                "stageDomainMapping": {
                "dev": "A012345BC6DEFG7HI8J",
                "qa": "B11111BB1BBBB1BB1B",
                "prod": "C22222CC2CCCC2CC2C"
                }
            }
        }
        ```
1. Configure your resource to use the targeted zoneId, for instance here, in my app, I am creating an SSL certificate:
    ```
    cat my-web-app-infrastructure-stack.ts
    ```

    ```typescript
    ...
    const stageHostedZoneIdMapping = this.node.tryGetContext('stageDomainMapping');
    const stageHostedZoneId = stageHostedZoneIdMapping[props.stageName?props.stageName:'dev'];
    const stageHostedZone = route53.HostedZone.fromHostedZoneId(this, 'StageHostedZone', stageHostedZoneId);
    const certificate = new DnsValidatedCertificate(
            this,
            "Certificate",
            {
                hostedZone: stageHostedZone,
                domainName: stageHostedZone.zoneName,
                region: "us-east-1",
                validation: CertificateValidation.fromDns(stageHostedZone),
            }
        );
    ...
    ```
