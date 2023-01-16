import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';

interface DNSInfrastructureStackProps extends cdk.StackProps {
  stageName: string;
}

export class DNSInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DNSInfrastructureStackProps) {
    super(scope, id, props);

    const stageDomainMapping = this.node.tryGetContext('stageDomainMapping');
    const stageDomain = stageDomainMapping[props.stageName];

    const hostedZone = new route53.PublicHostedZone(this, 'stageHostedZone', {zoneName: stageDomain});
    if(hostedZone.hostedZoneNameServers){
      new cdk.CfnOutput(this, `NS records`, {
        value: cdk.Fn.join(",", hostedZone.hostedZoneNameServers),
      });
    }

    new cdk.CfnOutput(this, `HostedZoneId`, {
      value: hostedZone.hostedZoneId,
    });

    new cdk.CfnOutput(this, `HostedZoneArn`, {
      value: hostedZone.hostedZoneArn,
    });
  }
}
