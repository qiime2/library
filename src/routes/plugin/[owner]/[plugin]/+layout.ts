import { mystParse } from 'myst-parser';
export async function load({ params, fetch }) {
  const response = await fetch(`/json/${params.owner}/${params.plugin}.json`);
  const repo_info = await response.json();
  const ast = mystParse(repo_info['Readme']);
  ast.children = ast.children.slice(1);

  return {
    repo_info,
    ast
  };
}
