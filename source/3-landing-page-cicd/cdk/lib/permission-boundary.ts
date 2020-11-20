import * as core from "@aws-cdk/core";
import * as iam from '@aws-cdk/aws-iam';

export class PermissionsBoundary implements core.IAspect {
    private readonly permissionsBoundaryArn: string;

    constructor(permissionBoundaryArn: string) {
        this.permissionsBoundaryArn = permissionBoundaryArn;
    }

    public visit(node: core.IConstruct): void {
        if (node instanceof iam.Role) {
            console.log('this node is a Role, going to add permission boundary!');
            const roleResource = node.node.findChild('Resource') as iam.CfnRole;
            roleResource.permissionsBoundary = this.permissionsBoundaryArn;
            // roleResource.addPropertyOverride('PermissionsBoundary', this.permissionsBoundaryArn);
        }
    }
}
