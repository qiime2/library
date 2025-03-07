<script lang='ts'>
    import FilterContext from "$lib/contexts/FilterContext.svelte";
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
    let unfiltered = data.plugins;

</script>

<FilterContext {unfiltered} distro_epochs={data.distros}>
    {@render children()}
</FilterContext>