<script lang='ts'>
    import MySt from "$lib/components/MyST.svelte";
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#await data.data}
    Loading content.
{:then data}
<article class="scroll-edge">
    <div class="max-width">
        <div class="max-w-4xl mx-2 mt-10">
            <MySt page={data}></MySt>
        </div>
    </div>
</article>
{/await}
