> This is intended for developers and people who are interested in learning more about the QIIME 2 Library. The Library is hosted at [https://library.qiime2.org](https://library.qiime2.org).

# QIIME 2 Library

The [QIIME 2 Library](https://library.qiime2.org) provides a means for QIIME 2 developers to host their plugins and for QIIME 2 users to discover new plugins.

## Adding a plugin to the library

To add to the library, please consult the docs [here](https://develop.qiime2.org/en/latest/plugins/how-to-guides/distribute-on-library.html).

## Source of data for the library

The library pulls content from [the catalog](https://github.com/qiime2/library-plugins) which is generally where new items should be added. Other content is dynamically fetched from the Forum and MyST documents.

## Developing the QIIME 2 Library

To host the app locally, first install the dependencies (while in the root of the repo):

```
npm install
```

Then run:

```
npm run dev
```

This will host the app on `localhost:5173` by default.

## Testing new data

There are a collection of scripts to update the JSON stored in the application which can be seen here:

https://github.com/qiime2/library/blob/main/package.json#L12-L20

The most common invocation will be:
```
npm run update --catalog=<path to library-plugins repo>
```
It is important that the `=` sign is present otherwise `--catalog` becomes a boolean instead of a path.

**Important**: The local checkout of the catalog WILL ONLY respect the HEAD commit, it will not consider any dirty (non-committed) changes to the working-tree.

You can also run
```
npm run update
```
without arguments to pull the latest default branch from Github.

Additionally, the sub commands `update:*` can be used, however there are dependencies between them to be aware of, see the udpate script for the specific DAG:
https://github.com/qiime2/library/blob/main/npm-scripts/update.ts


