import "@aws-cdk/assert/jest";
import * as cdk from "@aws-cdk/core";
import * as PerStageDns from "../lib/dns-infrastructure-stack";

test("Empty Stack", () => {
    const app = new cdk.App({
        context: {
            stageDomainMapping: {
                test: "dev-mycompany.com",
            },
        },
    });
    // WHEN
    const stack = new PerStageDns.DNSInfrastructureStack(app, "MyTestStack", {
        stageName: "test",
    });
    // THEN
    expect(stack).toHaveResource("AWS::Route53::HostedZone", {
        Name: "dev-mycompany.com.",
    });
});
