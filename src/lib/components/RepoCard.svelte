<script lang="ts">
    import "../../app.css";

    import CutOffList from "$lib/components/CutOffList.svelte";
    import { formatDate } from "$lib/scripts/util";

    export let repo_overview: Object;

    function getStatusColor() {
        let text_format = "text-white rounded px-2 font-bold ";

        if (repo_overview["Build Status"] === "passed") {
            text_format += "bg-green-500";
        } else if (repo_overview["Build Status"] === "failed") {
            text_format += "bg-red-500";
        } else if (repo_overview["Build Status"] === "in progress") {
            text_format += "bg-yellow-500";
        } else {
            // If we get here then... Who knows what we have. Just display the
            // text
            return "";
        }

        return text_format;
    }
</script>

<div class="repo-card">
    <h1>
        <a href="/plugin/{repo_overview["Plugin Owner"]}/{repo_overview["Plugin Name"]}">
            {repo_overview["Plugin Owner"]}/{repo_overview["Plugin Name"]}
        </a>
    </h1>
    <p class="description">
        {repo_overview["Description"]}
    </p>
    <div class="container2">
        <div>
            <span class="font-bold">User Docs: </span>
            <a href={repo_overview["User Docs"]}>{repo_overview["User Docs"]}</a>
        </div>
        <div style="word-break: break-all"><span class="font-bold">Releases:</span><CutOffList list={repo_overview["Releases"]} collapseNumber={5} /></div>
    </div>
    <div class="container">
        <div>
            <svg height="24" width="100" xmlns="http://www.w3.org/2000/svg" stroke-width="1.5" stroke="currentColor">
                <path fill="none" stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                <text stroke-width="1" x="25" y="18">{repo_overview["Stars"]}</text>
            </svg>
        </div>
        <div>
            <span class="font-bold">Last Commit:</span>
            {formatDate(repo_overview["Commit Date"])}&nbsp;
        </div>
        <div>
            <span class="font-bold">Build Status:</span>
            <span class="{getStatusColor()} h-fit">
                {repo_overview["Build Status"]}
            </span>
        </div>
    </div>
</div>

<style lang="postcss">
    .repo-card {
        @apply w-full
        border
        border-solid
        border-gray-300
        mx-auto
        p-4;
    }

    .link {
        @apply text-xl;
    }

    .description {
        line-height: 2.5ex;
        height: 2.5ex;
        @apply my-2
        overflow-y-auto;
    }

    .container {
        @apply lg:grid
        lg:grid-cols-[33%_33%_33%]
    }

    .container2 {
        @apply lg:grid
        lg:grid-cols-[33%_67%]
    }

    h1 {
        @apply text-2xl
        font-bold;
    }
</style>
