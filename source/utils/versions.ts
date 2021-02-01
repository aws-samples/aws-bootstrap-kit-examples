// Issues with asset upload on version 15.6 of node mean we restrict the node version to a specific range.
// See https://github.com/aws/aws-cdk/issues/12536 for more context
export function ensure_correct_node_version() {
    const version_arr = process.versions.node.split('.').map(Number)
    if ((version_arr[0] >= 15 && version_arr[1] >= 6) || version_arr[0] < 12) {
        throw new Error("Node version must be less than 15.6 and at least 12.0");
    }
}