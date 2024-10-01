export async function load({ params }) {
    const response = await fetch(`/json/${params.owner}/${params.plugin}.json`);
    const repo_info = await response.json();

    return {
        owner: params.owner,
        plugin: params.plugin,
        repo_info: repo_info
    }
}
