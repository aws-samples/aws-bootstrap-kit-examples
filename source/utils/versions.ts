export function ensure_correct_node_version() {
    const version_arr = process.versions.node.split('.').map(Number)
    if ((version_arr[0] >= 15 && version_arr[1] >= 6) || version_arr[0] < 12) {
        throw new Error("Node version must be less than 15.6 and at least 12.0");
    }
}