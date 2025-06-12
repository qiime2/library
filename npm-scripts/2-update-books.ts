import { join } from "node:path";
import fs from "node:fs";
import { cleanup, getLibraryCatalog, loadYamlPath } from "./helpers";

async function get_tutorials(docs) {
  try {
    let config = await fetch(docs + "/config.json");

    if (config.ok) {
      let configResult = await config.json();
      let title = configResult.projects[0].title;
      let source = configResult.projects[0].github;
      let list = configResult.projects[0].pages
        .filter(({ slug }: any) => slug && slug.startsWith("tutorial"))
        .map(({ slug, title, description, thumbnail }: any) => {
          let url = docs + "/";
          if (configResult.options.folders) {
            url += slug.replace(".", "/");
          } else {
            url += slug;
          }
          if (configResult.options.pretty_urls === false) {
            url += ".html";
          }
          return { title, description, thumbnail, url };
        });
      return {
        myst: true,
        book: { url: docs, title, source, description: "" },
        tutorials: list,
      };
    }
  } catch {}
  return { myst: false, book: { url: docs }, tutorials: [] };
}

export async function main(catalog) {
  let books = await loadYamlPath(join(catalog, "books", "index.yml"));
  books.distros = [];
  books.plugins = []

  if (!books.tutorials) {
    books.tutorials = [];
  }

  let { plugins } = JSON.parse(
    fs.readFileSync("./static/json/plugins.json", "utf-8"),
  );

  let { distros } = JSON.parse(
    fs.readFileSync("./static/json/distros.json", "utf-8"),
  );

  const seenBook = new Set();
  for (const distro of distros) {
    if (!distro.docs) {
      continue;
    }
    seenBook.add(distro.docs);
    const { myst, book, tutorials }: any = await get_tutorials(distro.docs);
    if (myst) {
      books.distros.push({ book, distro: distro.name });
    } else {
      books.distros.push({
        book: { ...book, title: "Docs for " + distro.title },
        distro: distro.name,
      });
    }
    for (const tutorial of tutorials) {
      books.tutorials.push(tutorial);
    }
  }

  for (const plugin of plugins) {
    if (!plugin.docs || seenBook.has(plugin.docs)) {
      continue;
    }

    const { myst, book, tutorials } = await get_tutorials(plugin.docs);
    if (myst) {
      books.plugins.push(book);
    }
  }

  books = {
    distros: books.distros,
    plugins: books.plugins,
    books: books.books,
    tutorials: books.tutorials
  }

  fs.writeFileSync(`./static/json/books.json`, JSON.stringify(books, null, 2));
}

if (process.argv[1] === import.meta.filename) {
  let catalog = await getLibraryCatalog();
  try {
    await main(catalog);
  } finally {
    await cleanup(catalog);
  }
}
