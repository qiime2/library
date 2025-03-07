<script>
    import BaseCard from "./BaseCard.svelte";
    let { owner, name, description } = $props();
</script>
<BaseCard href={`/plugins/${owner}/${name}`}>
        <div class='mx-auto inline-block'>
            <div class="flex flex-col w-max font-bold">
                <h3 class='text-2xl text-[#1a414c] mx-2 inline'>{name}</h3>
                <h4 class='text-sm text-gray-600 mx-2 inline place-self-center'>{owner}</h4>
            </div>
        </div>
        <p class='prose prose-sm mt-2 text-gray-600'>{description}</p>
</BaseCard>