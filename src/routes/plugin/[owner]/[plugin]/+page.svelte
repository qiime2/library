<script lang="ts">
    import { page } from '$app/state';
    import MyStMinimal from "$lib/components/MySTMinimal.svelte";

    // This data comes from +layout.ts
    let data = page.data;


</script>

<article class="prose lg:prose-lg">
    <MyStMinimal ast={data.ast}></MyStMinimal>
</article>