<script lang='ts'>
    import { sveltify } from "svelte-preprocess-react";
    import { ThemeProvider, TabStateProvider } from '@myst-theme/providers';
    import { keysTransform } from 'myst-transforms';
    import { MyST, DEFAULT_RENDERERS } from 'myst-to-react';

    let { ast } = $props();
    keysTransform(ast);

    const react = sveltify({
        MyST,
        ThemeProvider,
        TabStateProvider
    });
</script>

<react.TabStateProvider>
    <react.ThemeProvider theme={null} setTheme={()=>{}} renderers={DEFAULT_RENDERERS}>
        <react.MyST {ast}></react.MyST>
    </react.ThemeProvider>
</react.TabStateProvider>