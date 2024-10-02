export async function load({ params, fetch }) {
    const response = await fetch(`/json/${params.owner}/${params.plugin}.json`);
    const repo_info = await response.json();

    return {
        repo_info: repo_info
    }
}
