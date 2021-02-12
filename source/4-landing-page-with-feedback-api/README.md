# Welcome to your LandingPage repository!

## How to build and deploy it

Check our workshop [Activate workshop](https://activate.workshop.aws/030_landingpage.html)

## How was it built

This page describe how we built this app

### UI

#### Bootstrap a React Project

Here we leveraged the [create-react-app](https://create-react-app.dev/) utility to bootstrap a TypeScript React app.

1. Started by creating a new react application using the `create-react-app` tool

    ```bash
    cd <YOUR_REPOSITORY_SOURCE_FOLDER>
    npx create-react-app ui --template typescript  —-use-npm
    ```

1. Ran the app locally

    ```bash
    cd ui 
    npm run start
    ```

    Navigate to [http://localhost:3000](http://localhost:3000) to see the spinning React Logo.


In the next steps we add a styling lib and add simple feedback form to the website.

#### Install Material UI

We used the Material UI framework to simplify the UI styling.

From within the `frontend` folder, run:

```bash
npm install @types/react
npm install @material-ui/core
npm install @material-ui/styles
npm install @material-ui/lab
```

#### Create UI Components

We created some UI components.

1. Created a new subdirectory `./src/Components`. This folder is used to store our custom React components.

1. Created a new file `src/Components/Input.tsx` defining a text input field with the following contents:

    ```typescript
    import React from "react";
    import TextField from "@material-ui/core/TextField";

    interface InputProps {
      label: string;
      onChange: (value: string) => void;
      multiline?: boolean;
      className?: string;
    }

    export default function Input(props: InputProps) {
      return (
        <div className={props.className}>
          <TextField
            variant="outlined"
            label={props.label}
            onChange={e => props.onChange(e.target.value)}
            rows={(props.multiline && 5) || undefined}
            multiline={props.multiline || false}
            fullWidth
          />
        </div>
      );
    }
    ```

1. Created a new file `src/components/Header.tsx` defining an app banner with the following contents:

    ```typescript
    import React from "react";
    import MuiAppBar from "@material-ui/core/AppBar";
    import Toolbar from "@material-ui/core/Toolbar";
    import Typography from "@material-ui/core/Typography";
    import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

    const useStyles = makeStyles((theme: Theme) =>
      createStyles({
        title: {
          textAlign: "center",
          flexGrow: 1
        }
      })
    );

    export default function Header() {
      const classes = useStyles();
      return (
        <MuiAppBar position="static">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Activate Academy Landing Page
            </Typography>
          </Toolbar>
        </MuiAppBar>
      )
    }
    ```

1. Created a new file `src/components/SubmissionResult.tsx` defining a dialog box with the following contents:

    ```typescript
    import React from "react";
    import MuiSnackbar from "@material-ui/core/Snackbar";
    import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

    function Alert(props: AlertProps) {
      return <MuiAlert elevation={6} variant="filled" {...props} />;
    }

    interface SubmissionResultProps {
      open: boolean;
      onClose: () => void;
      variant: "success"|"error";
    }

    export default function SubmissionResult(props: SubmissionResultProps) {
      return (
        <MuiSnackbar open={props.open} autoHideDuration={2000} onClose={props.onClose}>
          <Alert onClose={props.onClose} severity={props.variant}>
            {props.variant === "success" ? "Form submitted!" : "Submission Failed."}
          </Alert>
        </MuiSnackbar>
      )
    }
    ```
1. Created a new file `src/Components/App.tsx` defining the app container with the following contents:

    ```typescript
    import {useState} from 'react';
    import Input from "./Input";
    import Button from "@material-ui/core/Button";
    import FormLabel from '@material-ui/core/FormLabel';
    import { makeStyles } from "@material-ui/core/styles";
    import Header from "./Header";
    import SubmissionResult from "./SubmissionResult";

    const useStyles = makeStyles({
      form: {
        paddingTop: 50,
        width: 300,
        margin: "0 auto"
      },
      button: {
        width: "100%"
      },
      field: {
        paddingBottom: 15
      }
    });

    function App() {
      const [name, setName] = useState("");
      const [email, setEmail] = useState("");
      const [subject, setSubject] = useState("");
      const [details, setDetails] = useState("");
      const [loading, setLoading] = useState(false);
      const [submitted, setSubmitted] = useState(false);
      const [failed, setFailed] = useState(false);
      const classes = useStyles();

      function onFail() {
        setLoading(false);
        setFailed(true);
      }

      function onClickButton() {
        //stub
      }

      return (
        <div>
          <Header />
          {failed 
            ? <SubmissionResult variant="error" open={failed} onClose={()=>setFailed(false)} />
            : <SubmissionResult variant="success" open={submitted} onClose={()=>setSubmitted(false)} />
          }
          <div className={classes.form}>
            <div className={classes.field}><FormLabel>Any feedbacks or comments ?</FormLabel></div>
            <Input className={classes.field} label="Name" onChange={setName} />
            <Input className={classes.field} label="Email" onChange={setEmail} />
            <Input className={classes.field} label="Subject" onChange={setSubject} />
            <Input className={classes.field} label="Details" onChange={setDetails} multiline />
            <Button 
              className={classes.button} 
              color="primary" 
              variant="contained" 
              onClick={onClickButton}
              disabled={loading}
            >
              SUBMIT
            </Button>
          </div>
        </div>
      );
    }

    export default App;
    ```

1. Updated the `src/index.tsx` to render the custom `src/Components/App.tsx` component. 

    ```typescript
    import React from 'react';
    import ReactDOM from 'react-dom';
    import './index.css';
    import App from './Components/App';
    import reportWebVitals from './reportWebVitals';

    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById('root')
    );

    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals();
    ```

1. Deleted files associated with the unused `App` component:

    ```
    rm ./src/App.tsx
    rm ./src/App.test.tsx
    rm ./src/App.css
    ```

1. Tested our changes locally
    ```
    npm run start
    ```
    ![react form screenshot](/images/040_landingPage/react-form-app.png)


### Infrastructure


In this section we explain how we created the backend of the app: a simple REST API enabling  vistors to publish feedbacks and store them in a database.

![backend infrastructure diagram](/images/040_landingPage/AWSBootstrapKit-Overview-LandingPage-backend.png)

To create the backend application we leveraged `cdk init` tool to automate the CDK app boilerplate creation.

1. Initialized the backend

```bash
cd ../ # coming back to the root of the git repository
mkdir infrastructure
cd infrastructure
cdk init app --language typescript
```

#### Created a Backend Stack

We created a stack with the backend API. The API is hosted in API Gateway, behind the API is a lambda function. The lambda function takes the API input and create a record of the form in DynamoDB.

1. Installed required dependencies for the stack

    ```bash
    $ npm i @aws-cdk/aws-lambda @aws-cdk/aws-dynamodb @aws-cdk/aws-apigateway
    ```

1. create the `surveyService` folder
    ```
    mkdir surveyService
    ```

1. Create the file `lib/surveyService/survey-service-stack.ts` and add the code for the backend API:


    ```typescript
    import * as cdk from "@aws-cdk/core";
    import * as lambda from "@aws-cdk/aws-lambda";
    import * as apiGateway from "@aws-cdk/aws-apigateway";
    import * as dynamo from "@aws-cdk/aws-dynamodb";
    import { Code, Runtime } from "@aws-cdk/aws-lambda";
    import { TableEncryption } from "@aws-cdk/aws-dynamodb";
    import { RemovalPolicy } from "@aws-cdk/core";


    interface SurveyServiceStackProps extends cdk.NestedStackProps {
        siteDistributionDomainName: string;
    }

    export class SurveyServiceStack extends cdk.NestedStack {
    public readonly api: apiGateway.RestApi;

    constructor(scope: cdk.Construct, id: string, props: SurveyServiceStackProps) {
        super(scope, id);

        // Create the Dynamo DB table
        const tableName = `Feedbacks-${this.node.addr}`;

        const feedbacksTable = new dynamo.Table(this, "Feedbacks", {
            tableName: tableName,
            encryption: TableEncryption.AWS_MANAGED,
            partitionKey: { name: "Key", type: dynamo.AttributeType.STRING },
            removalPolicy: RemovalPolicy.DESTROY,
        });

        // Create the Lambda with the business logic for CRUD action on the Feedback DynamoDB Table
        const handler = new lambda.Function(this, "LandingPageForm", {
            runtime: Runtime.NODEJS_12_X,
            code: Code.fromAsset(`${__dirname}/lambda`),
            handler: "index.handler",
            environment: {
                TABLE_NAME: tableName,
                Access_Control_Allow_Origin: `https://${props.siteDistributionDomainName}`,
            },
        });

        landingPageTable.grantWriteData(handler);

        // Create the API Gateway instance
        this.api = new apiGateway.RestApi(this, "LandingPageAPI", {
            restApiName: "Landing Page API",
            description: "Handles the request from the landing page.",
        });

        // Link
        const lambdaIntegration = new apiGateway.LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
        });

        const feedback = this.api.root.addResource("feedback");

        feedback.addMethod("POST", lambdaIntegration);
    }
    }
    ```
1. Updated the `lib/infrastructure-stack.ts` to add the newly created backend part of the infrastructure:
    ```typescript
    import * as cdk from '@aws-cdk/core';
    import { BackendStack } from './backend-stack';

    export class InfrastructureStack extends cdk.Stack {
      constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const backend = new BackendStack(this, "BackendStack", {
          frontendUrl: 'http://localhost:3000',
        });  
      }
    }
    ```

#### Created the Backend Lambda Function Code

In the same directory as the stack we created the code for the Lambda function.


1. Created a file `infrastructure/lib/lambda/index.js` and added the following code
    1. `mkdir lib/lambda`
    1. `touch lib/lambda/index.js`
    1. fill it with:
    ```typescript
    const AWS = require('aws-sdk');

    const allowedOrigins = [
      'http://localhost:3000', 
      process.env.FRONTEND_URL
    ]

    const TABLE_NAME = process.env.TABLE_NAME

    const dynamodb = new AWS.DynamoDB()

    exports.handler = async (event, context) => {
      const headers = {}

      if (allowedOrigins.includes(event['headers']['origin'])) {
        headers['Access-Control-Allow-Origin'] = event['headers']['origin']
      }

      const params = event['body']

      const { name, email, subject, details } = JSON.parse(params)
      const key = `${email.toLowerCase()}:${new Date().toISOString()}`

      await dynamodb.putItem({
        TableName: TABLE_NAME,
        Item: {
          'Key': { S: key },
          'Name': { S: name },
          'Email': { S: email },
          'Subject': { S: subject },
          'Details': { S: details }
        }
      }).promise()

      return { statusCode: 200, body: 'success', headers }
    }
    ```
  

## Built and deployed it

1. Built it
    ```sh
    npm run build           

    > infrastructure@0.1.0 build MyLandingPage/infrastructure
    > tsc
    ```
Deployed the CDK app into our dev account.

1. Went to the directory with your CDK stack, login using SSO and deploy the stack.

    ```bash
    $ aws sso login --profile dev
    $ npx cdk-sso-sync dev
    $ npx cdk deploy InfrastructureStack --profile dev
    ```

    Accepted the changes and waited for the stack to deploy.

1. From the output we were able to retrieve the API Gateway endpoint. This is what we'll use in the frontend code in the next section.

    ```bash
    Outputs:
    BackendStack.FrontendJSONConfig = { "apiUrl": "https://xxxxxxxxxx.execute-api.eu-west-1.amazonaws.com/prod/" }
    BackendStack.LandingPageAPIEndpointEXXX0X = https://xxxxxxxxxx.execute-api.eu-west-1.amazonaws.com/prod/

    Stack ARN:
    arn:aws:cloudformation:eu-west-1:123456786549:stack/BackendStack/a86453cb-85d3-4ac4-a58a-b214650047ec
    ```


#### Link backend and frontend


Now that the backend API has been created, let's link it to your frontend.

1. Create a new file `services.ts` file in the `ui/src/` defining an API POST method to submit the UI's form data to the backend. Use the following content: 
    ```typescript
      serv
    ```
1. Create a file `ui/public/config.json` with the content you got from the previous backend deployment step
    ```
    {"apiUrl":"https://xxxxxxxx.execute-api.eu-west-1.amazonaws.com/prod/"}
    ```

1. Now update our `src/Components/App.tsx` component to use our newly created API function.


    ```typescript
    //...
    import { submitForm } from "../services";

    //...

    export default function App() {
      //...

      function onClickButton() {
        setLoading(true);
        submitForm({ name, email, subject, details })
          .then(response => {
            if (response.status !== 200) {
              onFail()
              return;
            }
            setLoading(false);
            setSubmitted(true);
          })
          .catch(err => {
            onFail();
          });
      }
      
      // ...
    }
    ```

{{% notice warning %}}
Note that this API only uses basic CORS for protection, you may want to implement [Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/getting-credentials.html#getting-credentials-1.javascript) at a later stage to improve security and prevent abuse.
{{% /notice %}}


1. Try it out
  1. Re-launch the local server
  ```
  npm run start
  ```
  1. Go to [http://localhost:3000](http://localhost:3000/)
  1. Fill in and submit the form
    ![submit form](/images/040_landingPage/react-form-submitted.png)
  1. Check your database by going to the **DynamoDB** service console web page and clicking on your **Feedbacks** table
    ![dynamodb console screenshot](/images/040_landingPage/react-app-dynamo-table.png)


#### Add frontend hosting

Now that your app is functional, let's host it in the cloud using Amazon S3 and Cloudfront (AWS CDN)!

![fronend hosting infrastructure diagram combining S3 and Cloudfront](/images/040_landingPage/AWSBootstrapKit-Overview-LandingPage-hosting.png)


1. Create a dedicated file to describe your hosting solution
  ```
  cd ../infrastructure
  touch lib/hosting-stack.ts
  ```
1. Install the necessary CDK modules
  ```
  npm install @aws-cdk/aws-cloudfront @aws-cdk/aws-s3 @aws-cdk/aws-s3-deployment @aws-cdk/aws-cloudfront-origins
  ```
1. Describe the infrastructure setup into your new `hosting-stack.ts` file
  ```typescript
  import * as cloudfront from '@aws-cdk/aws-cloudfront';
  import * as s3 from '@aws-cdk/aws-s3';
  import * as s3deploy from '@aws-cdk/aws-s3-deployment';
  import { Construct, Stack, CfnOutput, RemovalPolicy } from '@aws-cdk/core';
  import * as origins from '@aws-cdk/aws-cloudfront-origins';

  /**
  * Static site infrastructure, which deploys site content to an S3 bucket and expose it through Cloudfront.
  */
  export class FrontendStack extends Stack {
      public readonly distribution: cloudfront.Distribution;
      public readonly siteBucket: s3.Bucket;
      constructor(parent: Construct, name: string) {
          super(parent, name);

          const frontendBuildFolder = '../frontend/build';

          // Content bucket
          this.siteBucket = new s3.Bucket(this, 'SiteBucket', {
              bucketName: `ssa-all-hands-app-${process.env.USER}`,

              // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
              // the new bucket, and it will remain in your account until manually deleted. By setting the policy to
              // DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
              removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
          });
          new CfnOutput(this, 'Bucket', { value: this.siteBucket.bucketName });

          // CloudFront distribution
          this.distribution = new cloudfront.Distribution(
              this,
              'SiteDistribution',
              {
                  defaultBehavior: { origin: new origins.S3Origin(this.siteBucket) },
                  defaultRootObject: 'index.html',
              }
          );
          new CfnOutput(this, 'DistributionDomainName', {
              value: this.distribution.distributionDomainName,
          });


          // Deploy site contents to S3 bucket
          new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
              sources: [s3deploy.Source.asset(frontendBuildFolder)],
              destinationBucket: this.siteBucket,
              distribution: this.distribution,
              distributionPaths: ['/*'],
          });
      }
  }
  ```