<script lang='ts'>
    import type { FormEventHandler } from "svelte/elements";

    let {name, attr} = $props();

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
<input type="checkbox" oninput={onInput} autocomplete="off"> {name}
</label>