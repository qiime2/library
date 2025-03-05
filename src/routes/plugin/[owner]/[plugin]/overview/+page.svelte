<script lang='ts'>
    import MySTDocument from "$lib/components/MySTDocument.svelte";
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#await data.page}
    Loading content.
{:then page}
<MySTDocument title={false} skipheading={true} {page} baseurl={data.baseurl}/>
{:catch}
    <p class='prose prose-sm sm:prose-base lg:prose-xl'>Documentation available at: <br/><a target="_blank" rel="noopener noreferrer" href={data.baseurl}>{data.baseurl}</a></p>

    <p>(To generate automated references, the documentation must be built with MyST and q2doc.)</p>
{/await}

