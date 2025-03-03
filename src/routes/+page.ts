export async function load({ fetch }) {
  const response = await fetch(`/json/index.json`);
  const index = await response.json();

  // It's not worth fishing around for this at the moment.
  index.distros = [
    {
      name: "Amplicon",
      description:
        "A suite of plugins that provide broad analytic functionality to support microbiome marker gene analysis from raw sequencing data through publication quality visualizations and statistics. ",
    },
    {
      name: "Moshpit",
      description:
        "MOSHPIT (MOdular SHotgun metagenome Pipelines with Integrated provenance Tracking) is a toolkit of plugins for whole metagenome assembly, annotation, and analysis.",
    },
    {
      name: "Pathogenome",
      description:
        "A suite of plugins to detect viral genomes and protein sequences from MAGs and contigs for antimicrobial-resistance.",
    },
    {
      name: "Tiny",
      description:
        "A minimal installation of the QIIME 2 Framework for developers that is intended to be extended with custom functionality and plugins.",
    },
  ];

  return index;
}
