import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const baseurl = "https://resources-dtz.pages.dev";
  return {
    baseurl,
    data: await fetch(`${baseurl}/index.json`).then((request) =>
      request.json(),
    ),
  };
};
