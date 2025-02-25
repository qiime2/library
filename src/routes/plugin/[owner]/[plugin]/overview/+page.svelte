<script lang='ts'>
    import MyST from "$lib/components/MyST.svelte";
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#await data.page}
    Loading content.
{:then page}
<div class="max-w-4xl">
    <MyST title={false} skipheading={true} {page} baseurl={data.baseurl}></MyST>
</div>
{:catch}
    <p class='prose lg:prose-xl'>Documentation available at: <br/><a target="_blank" rel="noopener noreferrer" href={data.baseurl}>{data.baseurl}</a></p>

    <p>(To generate automated references, the documentation must be built with MyST and q2doc.)</p>
{/await}

