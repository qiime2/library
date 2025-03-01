import fs from "node:fs";

function roundRows(list) {
  let n = Math.min(3, Math.floor((list.length + 1) / 4)) * 4;
  return list.slice(0, n - 1)
}

async function main() {
    let results = {}
    let plugins = JSON.parse(fs.readFileSync('./static/json/overview.json', 'utf-8'));
    let plugin_list: any[] = []
    for (const plugin of Object.values(plugins['Repos'])) {
      plugin_list.push(plugin)
    }
    plugin_list.sort((a, b) =>
      (new Date(b['Commit Date'])).getTime() - (new Date(a['Commit Date'])).getTime()
    )
    results['plugins'] = roundRows(plugin_list)



    let videos = fs.readFileSync('./static/json/videos.json', 'utf-8');
    results['videos'] = roundRows(JSON.parse(videos)[0].entries);

    fs.writeFileSync('./static/json/index.json', JSON.stringify(results, null, 2))
}


if (process.argv[1] === import.meta.filename) {
  await main();
}
