import { error, redirect } from "@sveltejs/kit";

export async function load({ params, parent, url }) {
  const data = await parent();
  for (const distro of data.distros) {
    const aliases: string[] = distro.alt;
    if (distro.name === params.distro || aliases.includes(params.distro)) {
      if (params.distro !== distro.name) {
        throw redirect(308, `/quickstart/${distro.name}${url.search}`);
      }
      return { distro };
    }
  }
  return error(404);
}
