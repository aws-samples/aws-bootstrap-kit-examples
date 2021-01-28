import { Stack, StackProps, Construct, Tags } from '@aws-cdk/core';
import { Vpc } from '@aws-cdk/aws-ec2';
import {
  Cluster,
  ContainerImage,
  AwsLogDriver,
  FargateTaskDefinition,
  Secret
} from '@aws-cdk/aws-ecs';
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns';
import {
  Dashboard,
  GraphWidget,
  TextWidget,
  LogQueryVisualizationType,
  LogQueryWidget
} from '@aws-cdk/aws-cloudwatch';
import { DatabaseClusterEngine, ServerlessCluster } from '@aws-cdk/aws-rds';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId
} from '@aws-cdk/custom-resources';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';

export class InfrastructureStack extends Stack {
  public readonly loadBalancer: any;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    Tags.of(this).add('ServiceName', this.node.tryGetContext('service_name'));

    const vpc = new Vpc(this, 'MyVpc', { maxAzs: 2 });

    ////////// CLOUDFRONT //////////////

    const cloudFront = new CloudFrontToS3(this, 'my-cloudfront-s3', {});

    // prepopulate bucket with a few images
    new BucketDeployment(this, 'DeployS3Images', {
      sources: [Source.asset('./static')],
      destinationBucket: cloudFront.s3Bucket!,
      destinationKeyPrefix: 'static'
    });
    const staticDomain =
      cloudFront.cloudFrontWebDistribution.distributionDomainName + '/static';

    ////////// Database ////////////

    const db = new ServerlessCluster(this, 'MyDatabase', {
      engine: DatabaseClusterEngine.AURORA_MYSQL,
      defaultDatabaseName: 'ecommerce',
      enableHttpEndpoint: true,
      vpc
    });

    // prepopulate the Database with a few products
    const createTable = new AwsCustomResource(this, 'CreateTable', {
      onCreate: {
        service: 'RDSDataService',
        action: 'executeStatement',
        parameters: {
          resourceArn: db.clusterArn,
          secretArn: db.secret?.secretArn,
          database: 'ecommerce',
          sql:
            'CREATE TABLE products ( productId int, name varchar(255), image varchar(255), price decimal(5, 2) );'
        },
        physicalResourceId: PhysicalResourceId.of(Date.now().toString())
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE
      })
    });
    db.secret?.grantRead(createTable);

    const insertTable = new AwsCustomResource(this, 'InsertTable', {
      onCreate: {
        service: 'RDSDataService',
        action: 'executeStatement',
        parameters: {
          resourceArn: db.clusterArn,
          secretArn: db.secret?.secretArn,
          database: 'ecommerce',
          sql: `INSERT INTO products VALUES ( 1, 'hat', 'https://${staticDomain}/hat.jpeg', 12.55), ( 2, 'shoe', 'https://${staticDomain}/shoe.jpg', 19.85);`
        },
        physicalResourceId: PhysicalResourceId.of(Date.now().toString())
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE
      })
    });
    db.secret?.grantRead(insertTable);

    insertTable.node.addDependency(createTable);

    ////////// ECS ////////////

    const cluster = new Cluster(this, 'MyCluster', { vpc });

    const NGINXLogDriver = new AwsLogDriver({ streamPrefix: 'myNGINX' });
    const PHPLogDriver = new AwsLogDriver({ streamPrefix: 'myPHP' });

    const taskDefinition = new FargateTaskDefinition(this, 'TaskDef');

    const nginxContainer = taskDefinition.addContainer('ab-nginx', {
      image: ContainerImage.fromAsset(__dirname + '/../../nginx'),
      environment: {
        PHP_HOST: 'localhost'
      },
      logging: NGINXLogDriver
    });
    nginxContainer.addPortMappings({ containerPort: 80 });

    const fargateService = new ApplicationLoadBalancedFargateService(
      this,
      'MyFargateService',
      {
        cluster: cluster,
        desiredCount: 2,
        taskDefinition,
        publicLoadBalancer: true
      }
    );
    this.loadBalancer = fargateService.loadBalancer;

    const phpContainer = taskDefinition.addContainer('ab-php', {
      image: ContainerImage.fromAsset(__dirname + '/../../php-fpm'),
      environment: {
        DOMAIN: 'http://' + fargateService.loadBalancer.loadBalancerDnsName
      },
      secrets: {
        SECRETS: Secret.fromSecretsManager(db.secret!)
      },
      logging: PHPLogDriver
    });
    phpContainer.addPortMappings({ containerPort: 9000 });

    db.connections.allowDefaultPortFromAnyIpv4();

    /////////////////// CloudWatch DashBoard /////////////////////

    const dashboard = new Dashboard(this, 'MyDashboard');
    dashboard.addWidgets(
      new TextWidget({
        markdown:
          '# Load Balancer\nmetrics to monitor load balancer metrics:\n* Amount of incoming requests\n* Latency with an alarm if max accepted latency exceeded.',
        width: 6,
        height: 6
      }),
      new GraphWidget({
        title: 'Requests',
        width: 9,
        left: [fargateService.loadBalancer.metricRequestCount()]
      }),
      new GraphWidget({
        title: 'Latency',
        width: 9,
        left: [fargateService.loadBalancer.metricTargetResponseTime()]
      })
    );
    dashboard.addWidgets(
      new LogQueryWidget({
        title: 'NGINX Logs',
        width: 24,
        logGroupNames: [NGINXLogDriver.logGroup?.logGroupName!],
        view: LogQueryVisualizationType.TABLE,
        queryLines: ['fields @timestamp, @message']
      })
    );
    dashboard.addWidgets(
      new LogQueryWidget({
        title: 'PHP Logs',
        width: 24,
        logGroupNames: [PHPLogDriver.logGroup?.logGroupName!],
        view: LogQueryVisualizationType.TABLE,
        queryLines: ['fields @timestamp, @message']
      })
    );
  }
}
