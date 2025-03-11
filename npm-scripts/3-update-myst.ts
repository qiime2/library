import fs from "node:fs";

async function add_xrefs(key, baseurl, references, seenRefs) {
  let xrefs;
  try {
    xrefs = await (await fetch(baseurl + "myst.xref.json")).json();
    let q2 = xrefs?.references
      .filter((ref) => ref.identifier?.startsWith("q2-"))
      .map((ref) => ({
        ...ref,
        data: `/myst/${key}/_${ref.data}`,
        url: `/myst/${key}/_${ref.data}`,
      }));

    for (const ref of q2) {
      if (!seenRefs.has(ref.identifier)) {
        seenRefs.add(ref.identifier);
        references.push(ref);
      }
    }
  } catch {
    return;
  }
}

let cache: Record<string, boolean> = {};
async function get_info(baseurl) {
  if (typeof cache[baseurl] !== "undefined") {
    return { base: baseurl, pretty: cache[baseurl] };
  }
  try {
    let pretty_urls = true;
    let config = await (await fetch(baseurl + "/config.json")).json();
    if (config.options.pretty_urls === false) {
      pretty_urls = false;
    }
    cache[baseurl] = pretty_urls;
    return { base: baseurl, pretty: pretty_urls };
  } catch {
    cache[baseurl] = true;
    return { base: baseurl, pretty: true };
  }
}

export async function main() {
  let plugins = JSON.parse(
    fs.readFileSync("./static/json/plugins.json", "utf-8"),
  );

  let { distros } = JSON.parse(
    fs.readFileSync("./static/json/distros.json", "utf-8"),
  );

  let lookup = {};
  let references: any[] = [];
  let myst_xref_json = {
    version: "1",
    myst: "0+library.qiime2.org",
    references,
  };
  let seenRefs = new Set();
  let seenBook = new Set();

  for (const distro of distros) {
    if (!distro.docs) continue;
    seenBook.add(distro.docs);
    lookup[distro.name] = await get_info(distro.docs);
    await add_xrefs(distro.name, distro.docs, references, seenRefs);
  }

  for (const plugin of plugins.plugins) {
    if (!plugin.docs) continue;
    lookup[plugin.name] = await get_info(plugin.docs);
    if (seenBook.has(plugin.docs)) {
      continue;
    }

    seenBook.add(plugin.docs);
    await add_xrefs(plugin.name, plugin.docs, references, seenRefs);
  }

  fs.writeFileSync("./static/json/_.json", JSON.stringify(lookup, null, 2));
  fs.writeFileSync(
    "./static/myst.xref.json",
    JSON.stringify(myst_xref_json, null, 2),
  );
}

if (process.argv[1] === import.meta.filename) {
  await main();
}
