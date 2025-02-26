<script lang='ts'>
  import MySTMinimal from "./MySTMinimal.svelte";
  import { u } from 'unist-builder';

  let { env_url, env_name, base_env } = $props();

  function key(props: Record<string, any> = {}) {
      return { key: Math.random().toString(36).slice(2), ...props }
  }

  const create = $derived(`conda env create --name ${env_name} --file ${env_url}`);
  const update = $derived(`conda env update --file ${env_url}`);

  const ast = $derived(u('div', key({class: '-my-5'}), [u('tabSet', key(), [
      u('tabItem', key({title: '[Fresh Install]'}), [
          u('code', key({lang: 'bash', class: '!my-3'}), create),
      ]),
      u('tabItem', key({title: '[Update Existing]'}), [
          u('paragraph', key(), [u('text', key(), `Activate your environment (${base_env}) and run:`)]),
          u('code', key({lang: 'bash', class: '!mb-3 !-mt-3'}), update),
      ])
  ])]));

</script>

<MySTMinimal {ast}/>