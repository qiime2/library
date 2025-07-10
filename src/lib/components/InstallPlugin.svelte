<script lang='ts'>
  import MySTMinimal from "./MySTMinimal.svelte";
  import { u } from 'unist-builder';

  let { env_url, env_name, base_env } = $props();

  function key(props: Record<string, any> = {}) {
      return { key: Math.random().toString(36).slice(2), ...props }
  }

  const create = $derived(`conda env create --name ${env_name} --file ${env_url}`);
  const create_silicon = $derived(`
    CONDA_SUBDIR=osx-64 conda env create \
    --name ${env_name} \
    --file ${env_url} \
    conda activate ${env_name} \
    conda config --env --set subdir osx-64
  `);
  const update = $derived(`conda env update --file ${env_url}`);

  const ast = $derived(u('div', key({class: '-my-5'}), [u('tabSet', key(), [
      u('tabItem', key({title: '[Fresh Install (Apple Silicon)]'}), [
          u('code', key({lang: 'bash', class: '!my-3'}), create_silicon),
      ]),
      u('tabItem', key({title: '[Fresh Install (all other architectures)]'}), [
          u('code', key({lang: 'bash', class: '!my-3'}), create),
      ]),
      u('tabItem', key({title: '[Update Existing]'}), [
          u('paragraph', key(), [u('text', key(), `Activate your environment (${base_env}) and run:`)]),
          u('code', key({lang: 'bash', class: '!mb-3 !-mt-3'}), update),
      ])
  ])]));

</script>

<MySTMinimal {ast}/>
