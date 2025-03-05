import { cleanup, get_octokit, getLibraryCatalog } from "./helpers";

import { main as update_distros } from "./0-update-distros";
import { main as update_videos } from "./0-update-videos";
import { main as update_workshops } from "./0-update-workshops";
import { main as update_plugins } from "./1-update-plugins";
import { main as update_books } from "./2-update-books";
import { main as update_myst } from "./3-update-myst";
import { main as update_index } from "./99-update-index";

if (process.argv[1] === import.meta.filename) {
  let octokit = await get_octokit();
  let catalog = await getLibraryCatalog();
  try {
    await Promise.all([
      update_distros(catalog, octokit),
      update_videos(catalog),
      update_workshops(catalog),
    ]);
    await update_plugins(catalog, octokit);
    await update_books(catalog);
    await update_myst(catalog);
    await update_index();
  } finally {
    cleanup(catalog);
  }
}
