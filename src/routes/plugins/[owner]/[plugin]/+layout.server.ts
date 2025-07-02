import { error } from "@sveltejs/kit";

export async function load({ params, fetch }) {
  const response = await fetch(`/json/${params.owner}/${params.plugin}.json`);
  if (response.ok) {
    const repo_info = await response.json();
    const ast = repo_info.readme;

    return {
      repo_info,
      ast,
    };
  }
  return error(404);
}
