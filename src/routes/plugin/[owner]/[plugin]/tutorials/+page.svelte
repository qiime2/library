<script lang='ts'>
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#each data.list as tutorial}
<div class='border-l-4 rounded border-l-blue-600 overflow-clip shadow-md'>
    <h2 class='bg-blue-50 px-2 text-lg py-2'><a href={tutorial.url}>{tutorial.title}</a></h2>
    <div class="px-4 pb-1">
        <a href={tutorial.url}>{tutorial.url}</a>
        <p>{tutorial.description || "(No description available.)"}</p>
    </div>
</div>
{:else}
    <p class='prose lg:prose-xl'>No tutorials found.</p>

    <p>(To generate automated references, the documentation must be built with MyST and q2doc.)</p>
{/each}