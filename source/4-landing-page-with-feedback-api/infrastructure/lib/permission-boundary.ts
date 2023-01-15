import * as core from "aws-cdk-lib";
import * as iam from 'aws-cdk-lib/aws-iam';
import { IConstruct } from "constructs";

export class AddPermissionsBoundaryToRoles implements core.IAspect {
    private readonly permissionsBoundaryArn: string;

    constructor(permissionBoundaryArn: string) {
        this.permissionsBoundaryArn = permissionBoundaryArn;
    }

    public visit(construct: IConstruct): void {
        if (construct instanceof iam.Role) {
            const roleResource = construct.node.findChild('Resource') as iam.CfnRole;
            roleResource.permissionsBoundary = this.permissionsBoundaryArn;
        }
    }
}