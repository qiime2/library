<script lang='ts'>
    import { sveltify } from "svelte-preprocess-react";
    import { ThemeProvider, ReferencesProvider, BaseUrlProvider } from '@myst-theme/providers';
    import { MyST, DEFAULT_RENDERERS } from 'myst-to-react';

    let {page, baseurl, title = true, skipheading = false}: {
        page: any, baseurl: string, title?: boolean, skipheading?: boolean} = $props();
    let ast = page.mdast;

    if (skipheading) {
        ast.children[0].children = ast.children[0].children.slice(1)
    }

    const react = sveltify({
        MyST,
        ThemeProvider,
        ReferencesProvider,
        BaseUrlProvider
    });
</script>

<react.ThemeProvider theme={null} setTheme={()=>{}} renderers={DEFAULT_RENDERERS}>
    <react.BaseUrlProvider {baseurl}>
        <react.ReferencesProvider
                references={{ ...page.references, article: page.mdast }}
                frontmatter={page.frontmatter}>
                <article class='prose prose-sm md:prose-base lg:prose-lg max-w-none'>
                    {#if title}
                    <h1>{page.frontmatter.title}</h1>
                    {/if}
                    <react.MyST {ast}></react.MyST>
                </article>
        </react.ReferencesProvider>
    </react.BaseUrlProvider>
</react.ThemeProvider>

