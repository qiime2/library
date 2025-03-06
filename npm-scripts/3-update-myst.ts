import fs from "node:fs";

export async function main() {
  let plugins = JSON.parse(
    fs.readFileSync("./static/json/plugins.json", "utf-8"),
  );

  let lookup = {};
  for (const plugin of plugins.plugins) {
    try {
      let config = await (await fetch(plugin.docs + "/config.json")).json();
      let pretty_urls = true;
      if (config.options.pretty_urls === false) {
        pretty_urls = false;
      }
      lookup[plugin.name] = { base: plugin.docs, pretty: pretty_urls };
    } catch {
      lookup[plugin.name] = { base: "", pretty: false };
    }
  }

  fs.writeFileSync("./static/json/_.json", JSON.stringify(lookup, null, 2));
}

if (process.argv[1] === import.meta.filename) {
  await main();
}
