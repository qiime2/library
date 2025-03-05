<script lang='ts'>
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>
<article class="prose max-w-4xl pt-5">
    {#if data.hits.length > 0}
    <p class='font-bold mb-0 pl-2'>
        Showing the last 30 topics from:
    </p>
    <ul class='mt-1'>
        {#each data.hits as hit}
        <li><a href={hit}>{hit}</a></li>
        {/each}
    </ul>
    {/if}
    <table>
    <thead>
        <tr>
            <th colspan="2" class='pl-2'>Topic</th>
            <th class='text-center'>Replies</th>
            <th class='text-center'>Views</th>
            <th class='text-center'>Activity</th>
        </tr>
    </thead>
    <tbody class='text-sm text-gray-600'>
    {#each data.topics as topic}
        <tr>
            <td class='text-lg align-middle pl-2'><a href={`https://forum.qiime2.org/t/${topic.slug}/${topic.id}`}>{topic.title}</a></td>
            <td class='align-middle text-center'>
            <div class="hidden md:flex gap-2 items-center">
                {#each topic.posters as poster}
                {@const user = data.users[poster.user_id]}
                    <a href={`https://forum.qiime2.org/u/${user.username}`} title={user.username} class='size-6'><img class='rounded-full size-6 !my-0' src={user.avatar} alt={user.username}/></a>
                {/each}
            </div>
            </td>
            <td class='font-bold align-middle text-center'>{topic.posts_count - 1}</td>
            <td class='align-middle text-center'>{topic.views}</td>
            <td class='align-middle text-center'>{(new Date(topic.bumped_at)).toDateString()}</td>
        </tr>
    {:else}
    <tr><td colspan="5" class='text-lg pl-2'>No discussions found</td></tr>
    {/each}
    </tbody>
    </table>

</article>