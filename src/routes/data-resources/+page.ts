import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  return {
    data: await fetch("https://resources.qiime2.org/index.json").then(
      (request) => request.json(),
    ),
  };
};
