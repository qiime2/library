import { cleanup, getLibraryCatalog } from "./helpers";

export async function main(catalog) {}

if (process.argv[1] === import.meta.filename) {
  let catalog = await getLibraryCatalog();
  try {
    await main(catalog);
  } finally {
    await cleanup(catalog);
  }
}
