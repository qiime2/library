import { error } from "@sveltejs/kit";

export async function load({ params, parent }) {
  const data = await parent();
  for (const distro of data.distros) {
    if (distro.name == params.distro) {
      return { distro };
    }
  }
  return error(404);
}
