<script lang="ts">
    import "../app.css";

	import { page } from '$app/stores';
</script>

<div id="container">
    <h1 class='text-4xl ml-10'>
        {$page.status}
    </h1>
    <h1 class='text-4xl ml-10 mt-10'>
        {$page.error?.message}
    </h1>
</div>

<style lang="postcss">
    #container {
        margin-top: 70px;
    }
</style>
