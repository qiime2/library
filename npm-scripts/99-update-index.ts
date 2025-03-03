import fs from "node:fs";

function roundRows(list, radix) {
  let n =
    Math.min(3, Math.max(Math.floor((list.length + 1) / radix), 1)) * radix;
  return list.slice(0, n - 1);
}

export async function main() {
  let results = {};
  let plugins = JSON.parse(
    fs.readFileSync("./static/json/plugins.json", "utf-8"),
  );
  results["plugins"] = roundRows(plugins.plugins, 4);

  let distros = fs.readFileSync("./static/json/distros.json", "utf-8");
  results["distros"] = JSON.parse(distros).distros;

  let books = fs.readFileSync("./static/json/books.json", "utf-8");
  results["books"] = roundRows(JSON.parse(books), 6);

  let videos = fs.readFileSync("./static/json/videos.json", "utf-8");
  results["videos"] = roundRows(JSON.parse(videos)[0].entries, 4);

  fs.writeFileSync(
    "./static/json/index.json",
    JSON.stringify(results, null, 2),
  );
}

if (process.argv[1] === import.meta.filename) {
  await main();
}
