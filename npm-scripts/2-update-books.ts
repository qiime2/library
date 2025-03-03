import { join } from "node:path";
import fs from "node:fs";
import { cleanup, getLibraryCatalog, loadYamlPath } from "./helpers";

export async function main(catalog) {
  let books = await loadYamlPath(join(catalog, "books", "index.yml"));
  fs.writeFileSync(
    `./static/json/books.json`,
    JSON.stringify(books.index, null, 2),
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
