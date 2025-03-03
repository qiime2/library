import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, parent }) => {
  let data = await parent();
  let docs = data.repo_info.docs;
  docs = docs.endsWith("/") ? docs.slice(0, docs.length - 1) : docs;

  try {
    let config = await fetch(docs + "/config.json");

    if (config.ok) {
      let configResult = await config.json();
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
      return { list };
    }
  } catch {}
  return {
    list: [],
  };
};
