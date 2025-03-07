import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, parent }) => {
  let data = await parent();
  let docs = data.repo_info.docs;
  docs = docs.endsWith("/") ? docs.slice(0, docs.length - 1) : docs;

  let xref_id = data.repo_info.name;
  if (xref_id.slice(0, 3) == "q2-") {
    xref_id = xref_id.slice(3);
  }
  // q2-fmt would become
  // q2-plugin-fmt
  xref_id = "q2-plugin-" + xref_id.toLowerCase();

  try {
    let index = await fetch(docs + "/myst.xref.json");
    if (index.ok) {
      let indexResults = await index.json();
      let ref = indexResults.references.filter(
        ({ identifier }: any) => identifier == xref_id,
      );
      if (ref.length > 0) {
        ref = ref[0];
        let data_url = docs + ref.data;
        return {
          baseurl: docs,
          page: await fetch(data_url).then((request) => request.json()),
        };
      }
    }
  } catch {}
  let p = Promise.reject();
  p.catch(() => {});
  return {
    baseurl: docs,
    page: p,
  };
};
