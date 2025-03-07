<script>
    import BaseCard from "./BaseCard.svelte";

    let { title, description } = $props();
</script>

<BaseCard href='#' classes='!bg-gray-50 !border-gray-200 !p-0'>
    <h1 class='text-center text-xl font-bold text-[#2a414c] pt-4 pb-2'>{title}</h1>
    <p class='prose prose-sm mt-2 text-gray-600 min-h-32 bg-white border-t border-t-gray-200 p-6 rounded-b-lg h-full'>{description}</p>
</BaseCard>