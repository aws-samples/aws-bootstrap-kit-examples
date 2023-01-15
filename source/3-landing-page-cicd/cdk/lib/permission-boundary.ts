import { IAspect } from "aws-cdk-lib";
import {IConstruct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class AddPermissionsBoundaryToRoles implements IAspect {
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
