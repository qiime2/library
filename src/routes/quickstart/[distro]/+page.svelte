<script lang='ts'>
    import MyStMinimal from '$lib/components/MySTMinimal.svelte';
    import { visit } from "unist-util-visit";
    import { fade } from 'svelte/transition';
    import MyStTableOfContents from '$lib/components/MySTTableOfContents.svelte';

    type ReleaseEnvFiles = {
        source?: string;
        generic?: string;
        linux?: string;
        osx?: string;
    };

    function sortEpochs(a: string, b: string) {
        const [yearA, monthA] = a.split(".").map((x) => parseInt(x, 10));
        const [yearB, monthB] = b.split(".").map((x) => parseInt(x, 10));

        if (yearA !== yearB) {
            return yearB - yearA;
        }

        return monthB - monthA;
    }

    function defaultLegacyInstallUrl(
        epoch: string,
        distroName: string,
        os: "linux" | "osx",
    ) {
        if (os === "linux") {
            return `https://raw.githubusercontent.com/qiime2/distributions/refs/heads/dev/${epoch}/${distroName}/released/qiime2-${distroName}-ubuntu-latest-conda.yml`;
        }

        return `https://raw.githubusercontent.com/qiime2/distributions/refs/heads/dev/${epoch}/${distroName}/released/qiime2-${distroName}-macos-latest-conda.yml`;
    }

    function distributionRawUrl(path: string) {
        return `https://raw.githubusercontent.com/qiime2/distributions/refs/heads/dev/${path}`;
    }

    let {data} = $props();
    let distro = data.distro;
    const aliases: string[] = distro.alt;
    const distroPlugins: Record<string, Record<string, any[]>> = {};
    const distroSourcesByEpoch: Record<string, string> = {};
    const releaseEnvFilesByEpoch: Record<string, ReleaseEnvFiles> =
        (data.release_env_files?.[distro.name] || {}) as Record<string, ReleaseEnvFiles>;

    data.plugins.sort((a: any, b: any) => a.name.localeCompare(b.name))

    for (const plugin of data.plugins) {
        for (const depoch of plugin.distros) {
            const [epoch, distro, env] = depoch;
            if (!distroPlugins[distro]) {
                distroPlugins[distro] = {};
            }
            if (!distroPlugins[distro][epoch]) {
                distroPlugins[distro][epoch] = [];
            }

            distroPlugins[distro][epoch].push(plugin)
        }
    }

    if (!distroPlugins[distro.name]) {
        distroPlugins[distro.name] = {};
    }
    for (const name of [distro.name, ...aliases]) {
        if (!distroPlugins[name]) {
            continue;
        }

        for (const epoch of Object.keys(distroPlugins[name])) {
            if (!distroPlugins[distro.name][epoch]) {
                distroPlugins[distro.name][epoch] = distroPlugins[name][epoch];
                distroSourcesByEpoch[epoch] = name;
            }
        }
    }

    const distroEpochs = (
        Object.keys(releaseEnvFilesByEpoch).length > 0
            ? [...Object.keys(releaseEnvFilesByEpoch)]
            : [...Object.keys(distroPlugins[distro.name])]
    );
    distroEpochs.sort(sortEpochs);

    let selectedEpoch: string = $state(distroEpochs[0]);
    let selectedReleaseFiles: ReleaseEnvFiles = $derived(
        releaseEnvFilesByEpoch[selectedEpoch] || {},
    );
    let distroName: string = $derived(
        selectedReleaseFiles.source || distroSourcesByEpoch[selectedEpoch] || distro.name,
    );

    let linuxInstallable: boolean = $derived(
        Boolean(selectedReleaseFiles.linux || selectedReleaseFiles.generic || !releaseEnvFilesByEpoch[selectedEpoch])
    );
    let macosInstallable: boolean = $derived(
        Boolean(selectedReleaseFiles.osx || selectedReleaseFiles.generic || !releaseEnvFilesByEpoch[selectedEpoch])
    );

    let linuxUrl: string = $derived(
        (selectedReleaseFiles.linux ? distributionRawUrl(selectedReleaseFiles.linux) : null)
        || (selectedReleaseFiles.generic ? distributionRawUrl(selectedReleaseFiles.generic) : null)
        || defaultLegacyInstallUrl(selectedEpoch, distroName, "linux"),
    );

    let macosUrl: string = $derived(
        (selectedReleaseFiles.osx ? distributionRawUrl(selectedReleaseFiles.osx) : null)
        || (selectedReleaseFiles.generic ? distributionRawUrl(selectedReleaseFiles.generic) : null)
        || defaultLegacyInstallUrl(selectedEpoch, distroName, "osx"),
    );

    let installNotice: string | null = $derived.by(() => {
        if (linuxInstallable && macosInstallable) {
            return null;
        }
        if (linuxInstallable && !macosInstallable) {
            return "This release provides an install environment for Linux/WSL only.";
        }
        if (!linuxInstallable && macosInstallable) {
            return "This release provides an install environment for macOS only.";
        }

        return "This release currently does not provide install environment files.";
    });

    let ast = $derived.by(() => {
        let ast = structuredClone(data.install);
        visit(ast, (node) => {
            if (node.type === "tabSet" && Array.isArray(node.children)) {
                node.children = node.children.filter((child: any) => {
                    if (child.type !== "tabItem") {
                        return true;
                    }
                    if (child.title === "Linux / Windows WSL") {
                        return linuxInstallable;
                    }
                    if (
                        child.title === "macOS (Apple Silicon)"
                        || child.title === "macOS (Intel)"
                    ) {
                        return macosInstallable;
                    }
                    return true;
                });
            }
        })

        visit(ast, (node) => {
            if (node.value) {
                let value = node.value
                value = value.replaceAll('((epoch))', selectedEpoch);
                value = value.replaceAll('((distro))', distroName);
                value = value.replaceAll('((linux_url))', linuxUrl);
                value = value.replaceAll('((macos_url))', macosUrl);
                value = value.replaceAll('((env_name))', `rachis-${distro.name}-${selectedEpoch}`);
                node.value = value;
            }
        })
        return ast
    })
</script>
<div class="max-width">
<article class='prose max-w-4xl prose-sm md:prose-base lg:prose-lg'>
    <h1 id={distro.name}>{distro.title}</h1>
    <p>{distro.description}</p>
    <dl class='leading-normal'>
        <dt>Version</dt>
        <dd><select class="cursor-pointer border border-gray-200 shadow-inner rounded px-5 py-2" bind:value={selectedEpoch}>
            {#each distroEpochs as epoch}
            <option>{epoch}</option>
            {/each}
        </select></dd>
        {#if distro.docs}
        <dt>Links</dt>
        <dd>
        <a href={distro.docs} class='flex w-max items-center gap-1'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class='size-4' fill='currentColor'><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><title>Documentation</title><path d="M96 0C43 0 0 43 0 96L0 416c0 53 43 96 96 96l288 0 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-64c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L384 0 96 0zm0 384l256 0 0 64L96 448c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16zm16 48l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>
            Documentation
        </a>
        </dd>
        <dd class='!mt-0.5'>
            <a href={`https://github.com/qiime2/distributions`} class='flex w-max items-center gap-1'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class='size-4' fill='currentColor'><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><title>GitHub</title><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
                Source Code
            </a>
        </dd>
        <dd class='!mt-0.5'>
            <a href='https://packages.qiime2.org/qiime2/{selectedEpoch}/{distroName}/released/' class='flex w-max items-center gap-1'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class='size-4' fill='currentColor'><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M0 32C0 14.3 14.3 0 32 0l72.9 0c27.5 0 52 17.6 60.7 43.8L257.7 320c30.1 .5 56.8 14.9 74 37l202.1-67.4c16.8-5.6 34.9 3.5 40.5 20.2s-3.5 34.9-20.2 40.5L352 417.7c-.9 52.2-43.5 94.3-96 94.3c-53 0-96-43-96-96c0-30.8 14.5-58.2 37-75.8L104.9 64 32 64C14.3 64 0 49.7 0 32zM244.8 134.5c-5.5-16.8 3.7-34.9 20.5-40.3L311 79.4l19.8 60.9 60.9-19.8L371.8 59.6l45.7-14.8c16.8-5.5 34.9 3.7 40.3 20.5l49.4 152.2c5.5 16.8-3.7 34.9-20.5 40.3L334.5 307.2c-16.8 5.5-34.9-3.7-40.3-20.5L244.8 134.5z"/></svg>
                Conda Channel
            </a>
        </dd>
        {/if}
        <dt>Built-in plugins</dt>
        <dd>
            <ul class='list-none flex flex-wrap !pl-0 !mt-0'>
                {#each (distroPlugins[distro.name][selectedEpoch] || []) as plugin (plugin.name)}
                <li transition:fade class="!my-0 after:content-[','] last:after:content-['']">
                    <a href='/plugins/{plugin.owner}/{plugin.name}'>{plugin.name}</a>
                </li>
                {/each}
            </ul>
        </dd>
    </dl>
    <h2 id="{distro.name}-installation">Installation Instructions</h2>
    <p>You can install this distribution with either conda or docker.</p>
    {#if installNotice}
    <p class='bg-yellow-50 border border-yellow-200 rounded px-4 py-2'>{installNotice}</p>
    {/if}
    <MyStTableOfContents {ast} />
    {#key selectedEpoch}
    <MyStMinimal {ast} />
    {/key}
</article>
</div>
