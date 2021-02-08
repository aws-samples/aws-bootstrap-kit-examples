import * as core from "@aws-cdk/core";
import * as iam from '@aws-cdk/aws-iam';

export class AddPermissionsBoundaryToRoles implements core.IAspect {
    private readonly permissionsBoundaryArn: string;

    constructor(permissionBoundaryArn: string) {
        this.permissionsBoundaryArn = permissionBoundaryArn;
    }

    public visit(construct: core.IConstruct): void {
        if (construct instanceof iam.Role) {
            const roleResource = construct.node.findChild('Resource') as iam.CfnRole;
            roleResource.permissionsBoundary = this.permissionsBoundaryArn;
        }
    }
}