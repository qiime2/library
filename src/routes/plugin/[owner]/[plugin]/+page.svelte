<script lang="ts">
    import SvelteMarkdown from "@humanspeak/svelte-markdown";
    import { page } from '$app/state';

    // This data comes from +layout.ts
    let data = page.data;


</script>

<SvelteMarkdown source={data.repo_info["Readme"]} options={{ gfm: true}} />
