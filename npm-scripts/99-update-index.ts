import fs from "node:fs";

function roundRows(list, radix) {
  let n =
    Math.min(2, Math.max(Math.floor((list.length + 1) / radix), 1)) * radix;
  return list.slice(0, n - 1);
}

export async function main() {
  let results = {};
  let plugins = JSON.parse(
    fs.readFileSync("./static/json/plugins.json", "utf-8"),
  );

  plugins.plugins.sort((a, b) => (a.in_distro || 0) - (b.in_distro || 0));
  results["plugins"] = roundRows(plugins.plugins, 4);

  let distros = fs.readFileSync("./static/json/distros.json", "utf-8");
  results["distros"] = JSON.parse(distros).distros;

  let books = JSON.parse(fs.readFileSync("./static/json/books.json", "utf-8"));
  let list = [ ...books.distros.map((d) => d.book), ...books.plugins, ...books.books]
  results["books"] = roundRows(list, 6);

  let videos = fs.readFileSync("./static/json/videos.json", "utf-8");
  results["videos"] = roundRows(JSON.parse(videos)[0].entries, 4);

  results["last_updated"] = new Date();
  fs.writeFileSync(
    "./static/json/index.json",
    JSON.stringify(results, null, 2),
  );
}

if (process.argv[1] === import.meta.filename) {
  await main();
}
