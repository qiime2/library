import { cleanup, get_octokit, getLibraryCatalog } from "./helpers";

export async function main(catalog, octokit) {}

if (process.argv[1] === import.meta.filename) {
  let octokit = await get_octokit();
  let catalog = await getLibraryCatalog();
  try {
    await main(catalog, octokit);
  } finally {
    await cleanup(catalog);
  }
}
