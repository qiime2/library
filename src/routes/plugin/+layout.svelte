<script lang='ts'>
    import FilterContext from "$lib/contexts/FilterContext.svelte";
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
    let unfiltered = data.plugins;

</script>

<FilterContext {unfiltered}>
    {@render children()}
</FilterContext>