<script>
    import BaseCard from "./BaseCard.svelte";

    let { url, title, description } = $props();
</script>
<BaseCard href={url} classes='!p-0 !border-gray-200 !border-l-0 !w-[12.89rem] !rounded-r-sm !bg-gray-50'>
    <div class='flex rounded-lg'>
        <div class='bg-gray-600 text-white h-60 w-3 rounded-l-lg'></div>
        <div class='w-full'>
            <h2 class='text-[#2a414c] font-bold text-center px-4 pt-4 tracking-wider'>{title}</h2>
            <div class='text-center decoration-wavy underline decoration-gray-400 border-y border-y-gray-400 pb-3.5 mt-5 w-max mx-auto text-xs leading-0'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
            {#if description}
            <div class='flex absolute top-0 h-full bg-white opacity-0 hover:opacity-100 transition-opacity p-4 text-sm text-gray-600 pl-5 rounded-r-sm leading-tight'><span class="my-auto block pb-8">{description}</span></div>
            {/if}
        </div>
    </div>
</BaseCard>
