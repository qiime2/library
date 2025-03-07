<script lang='ts'>
    import MySTDocument from "$lib/components/MySTDocument.svelte";
	import type { PageProps } from './$types';
    import { page as params } from '$app/state';

	let { data }: PageProps = $props();
</script>

{#await data.page}
    Loading content.
{:then page}
<MySTDocument title={false} skipheading={true} {page} baseurl={`/myst/${params.params.plugin}/_`} />
{:catch}
    <p class='prose prose-sm sm:prose-base lg:prose-xl'>
        {#if data.baseurl}
        Documentation available at: <br/><a target="_blank" rel="noopener noreferrer" href={data.baseurl}>{data.baseurl}</a>
        {:else}
        No documentation exists.
        {/if}
    </p>

    <p>(To generate automated references, the documentation must be built with MyST and q2doc.)</p>
{/await}

