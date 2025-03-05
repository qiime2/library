<script lang="ts">
    import { page } from '$app/state';
    import MyStMinimal from "$lib/components/MySTMinimal.svelte";

    // This data comes from +layout.ts
    let data = page.data;


</script>

<article class="prose prose-sm sm:prose-base lg:prose-lg max-w-[calc(100vw_-_2rem)]">
    <MyStMinimal ast={data.ast}></MyStMinimal>
</article>