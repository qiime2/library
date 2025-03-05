import fs from "node:fs";
import { cleanup, getLibraryCatalog, loadYamlPath } from "./helpers";
import { join } from "node:path";

export async function main(catalog) {
  let workshops = await loadYamlPath(join(catalog, "workshops", "index.yml"));

  fs.writeFileSync(
    `./static/json/workshops.json`,
    JSON.stringify(workshops.index, null, 2),
  );
}

if (process.argv[1] === import.meta.filename) {
  let catalog = await getLibraryCatalog();
  try {
    await main(catalog);
  } finally {
    await cleanup(catalog);
  }
}
