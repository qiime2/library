<script lang="ts">

	import { page } from '$app/state';
</script>

<div class='max-width'>
    <article class="prose lg:prose-xl mt-10 max-w-5xl">
        <h1>
            {page.status}
            {#if page.status === 404}
             - Page Not Found
            {/if}
        </h1>
        <p>
            {#if page.status === 404}
            Please make sure you have the correct URL, as it is possible that the page has been removed or renamed.
            {:else}
            {page.error?.message}
            {/if}
        </p>
    </article>
</div>