<script lang="ts">
    import { replaceState } from '$app/navigation';

    type MDAST = {
        type: string
        html_id: string
        depth: number
        children?: MDAST[]
    }

    function scan(ast: MDAST, maxdepth: number) {
        if (ast.type == 'heading' && ast.depth <= maxdepth) {
            return [ast]
        }
        let headers: MDAST[] = [];
        for (const child of ast.children || []) {
            headers = headers.concat(scan(child, maxdepth))
        }
        return headers
    }

    let { ast, max_depth=Infinity } = $props();
    let headers = scan(ast, max_depth + 1)

    function scrollTo(event: Event, id: string) {
        let target = document.getElementById(id)
        if (target) {
            event.preventDefault();
            target.scrollIntoView({behavior: "smooth"});
            replaceState(`#${id}`, {})
        }
    }
</script>

<ol>
    {#each headers as header}
    <li><a href={`#${header.html_id}`} onclick={(e) => scrollTo(e, header.html_id)}>{header.html_id}</a></li>
    {/each}
</ol>