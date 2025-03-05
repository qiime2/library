<script lang='ts'>
  import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="max-width">
    <article class="prose prose-sm md:prose-base lg:prose-lg mt-10 mx-2 max-w-none">
        <h1>Past Workshops</h1>
        <table class='w-full'>
            <thead>
                <tr><th>Title</th><th>Location</th><th>Dates</th></tr>
            </thead>
            <tbody>
                {#each data.workshops as workshop}
                {@const [start, end] = workshop.dates.split('-')}
                <tr>
                    <td class='align-middle'>
                        {#if workshop.url !== ""}
                        <a href={workshop.url} target="_blank" rel="noopener noreferrer">{workshop.title}</a>
                        {:else}
                        {workshop.title}
                        {/if}
                    </td>
                    <td class='align-middle'>{workshop.location}</td>
                    <td class='w-max whitespace-nowrap align-middle'>{start}<br/> - {end}</td>
                </tr>
                {/each}
            </tbody>

        </table>
    </article>
</div>
