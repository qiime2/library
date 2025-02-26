import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const baseurl = "https://resources.qiime2.org";
  return {
    baseurl,
    data: await fetch(`${baseurl}/index.json`).then((request) =>
      request.json(),
    ),
  };
};
