<script lang='ts'>
    import MySTDocument from "$lib/components/MySTDocument.svelte";
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#await data.data}
    Loading content.
{:then page}
<article class="scroll-edge">
    <div class="max-width">
        <div class="max-w-4xl mx-2 mt-10">
            <MySTDocument {page} baseurl={data.baseurl}/>
        </div>
    </div>
</article>
{/await}
