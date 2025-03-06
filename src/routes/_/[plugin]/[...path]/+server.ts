import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import lookup from "../../../../../static/json/_.json";

export const GET: RequestHandler = async ({ params }) => {
  const { base, pretty } = lookup[params.plugin as keyof typeof lookup];
  let url = base + params.path;
  if (!(pretty || url.endsWith(".json"))) {
    url += ".html";
  }
  return redirect(307, url);
};
