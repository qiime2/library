<script lang="ts">
    import { pushState } from '$app/navigation';
    import { toText } from 'myst-common';

    type MDAST = {
        type: string
        html_id: string
        depth: number
        label: string
        children?: MDAST[]
    }

    function scan(ast: MDAST, maxdepth: number) {
        if (ast.type == 'heading' && ast.depth <= maxdepth) {
            ast.label = toText(ast)
            return [ast]
        }
        let headers: MDAST[] = [];
        for (const child of ast.children || []) {
            headers = headers.concat(scan(child, maxdepth))
        }
        return headers
    }

    let { ast, max_depth=Infinity } = $props();
    let headers = structuredClone(scan(ast, max_depth + 1));
    let max = 10;
    for (const header of headers) {
        max = Math.min(max, header.depth)
    }
    max = Math.max(max - 1, 0)
    for (const header of headers) {
        header.depth -= max
    }


    function scrollTo(event: Event, id: string) {
        let target = document.getElementById(id)
        if (target) {
            event.preventDefault();
            target.scrollIntoView({behavior: "smooth"});
            pushState(`#${id}`, {})
        }
    }
</script>

<dl>
    <dt>Table of Contents</dt>
    <dd class='pl-0 !ps-0 !-mt-4'>
        <ol class='list-none flex flex-col'>
            {#each headers as header}
            <li class='!my-0'><a class='block' href={`#${header.html_id}`} onclick={(e) => scrollTo(e, header.html_id)}>
                {#if header.depth <= 1}
                <div class='indent-0'>{header.label}</div>
                {:else if header.depth <= 2}
                <div class='indent-4'>{header.label}</div>
                {:else if header.depth <= 3}
                <div class='indent-8'>{header.label}</div>
                {:else if header.depth <= 4}
                <div class='indent-10'>{header.label}</div>
                {/if}
            </a></li>
            {/each}
        </ol>
    </dd>
</dl>