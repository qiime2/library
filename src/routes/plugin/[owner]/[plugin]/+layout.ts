export async function load({ params, fetch }) {
  const response = await fetch(`/json/${params.owner}/${params.plugin}.json`);
  const repo_info = await response.json();
  const ast = repo_info.readme;
  ast.children = ast.children.slice(1);

  return {
    repo_info,
    ast,
  };
}
