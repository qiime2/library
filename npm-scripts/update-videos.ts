import { argv } from "node:process";
import fs from "node:fs";
import { getLibraryVideos } from "./helpers";
import { XMLParser } from 'fast-xml-parser';

const DEFAULT_LIBRARY_REPO = "https://github.com/qiime2/library-plugins.git";


async function main(library) {
    let videos = await getLibraryVideos(library)
    const parser = new XMLParser()
    videos = await Promise.all(videos.map(async (source)=> {
        if (source.type === 'rss') {
            let data: any = await (await fetch(source.url)).text();
            data = parser.parse(data)

            source.url = data.feed.author.uri;
            source.entries = data.feed.entry.map((entry) => ({
                id: entry['yt:videoId'],
                title: entry.title,
                description: entry['media:group']['media:description'],
                uploader: entry.author.name,
                uploader_id: `channel/${entry['yt:channelId']}`,
                timestamp: (new Date(entry.published)).getTime() / 1000
            }));
        }
        source.timestamp = Math.max(...source.entries.map(({timestamp}) => timestamp))
        return source
    }));

    videos.sort((a, b) => b.timestamp - a.timestamp);


    fs.writeFileSync(
        `./static/json/videos.json`,
        JSON.stringify(videos, null, 2),
    );
}


if (process.argv[1] === import.meta.filename) {
  let library = argv[argv.length - 1];
  if (process.argv.length <= 2) {
    library = DEFAULT_LIBRARY_REPO;
  }

  await main(library);
}
