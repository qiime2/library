import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import lookup from "../../../../../../../static/json/_.json";

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD",
    },
  });
};

export const GET: RequestHandler = async ({ params }) => {
  const { base, pretty } = lookup[params.key as keyof typeof lookup];
  let url = base + params.path;
  if (!(pretty || url.endsWith(".json"))) {
    url += ".html";
  }
  return new Response(null, {
    status: 307,
    headers: {
      location: url,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD",
    },
  });
};
