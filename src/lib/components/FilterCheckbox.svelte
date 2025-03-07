<script lang='ts'>
    import type { FormEventHandler } from "svelte/elements";

    let {name, attr} = $props();
    let checked = attr.has(name);

    const onInput: FormEventHandler<HTMLInputElement> = (event) => {
        let checked = (event.target as HTMLInputElement).checked;
        if (checked) {
            attr.add(name)
        } else {
            attr.delete(name)
        }
    }
</script>

<label class='flex items-center gap-1'>
<input type="checkbox" oninput={onInput} {checked} autocomplete="off"> {name}
</label>

<style lang='postcss'>
    @reference 'tailwindcss';

    label:has( input:checked ), label:hover {
        @apply text-black;
    }
    label {
        @apply text-gray-600;
    }

</style>