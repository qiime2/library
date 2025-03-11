## Using Conda

Steps 1-4 will guide you through installing `conda` and your selected _base distribution_.

### 1. Installing Miniconda

[Miniconda](https://www.anaconda.com/docs/getting-started/miniconda/main)
provides the `conda` environment and package manager, and is the recommended way to install QIIME 2.
Follow the [Miniconda instructions](https://www.anaconda.com/docs/getting-started/miniconda/install)
for downloading and installing Miniconda.
It is important to follow all of the directions provided in the
[Miniconda instructions](https://www.anaconda.com/docs/getting-started/miniconda/install),
particularly ensuring that you run `conda init` at the end of the installation process (via installer or manual command),
to ensure that your Miniconda installation is fully installed and available for the following commands.

### 2. Updating Miniconda

After installing Miniconda and opening a new terminal, make sure you're
running the latest version of `conda`:

```bash
   conda update conda
```

### 3. Install the base distribution's `conda` environment

We **highly** recommend creating a _new_ environment specifically for the
QIIME 2 distribution and release being installed, as there are many required
dependencies that you may not want added to an existing environment.

You can choose whatever name you'd like for the environment.
In this example, we'll name the environments `((env_name))`
to indicate what QIIME 2 release is installed (i.e. `((epoch))`).

:::::{tab-set}

:::{tab-item} Instructions

Select the tab that fits the operating system that you want QIIME 2 to run on.

(To install an older version, use the dropdown in the distribution details above.)
:::

:::{tab-item} Linux / Windows WSL
These instructions are for users running on Linux or the Windows Subsystem for Linux (WSL v2).

```bash
conda env create \
  --name ((env_name)) \
  --file ((linux_url))
```

:::

:::{tab-item} macOS (Apple Silicon)

These instructions are for users with Apple Silicon chips (M1, M2, etc), and configures the installation of QIIME 2 in Rosetta 2 emulation mode (as ARM builds are not yet available).

```bash
CONDA_SUBDIR=osx-64 conda env create \
  --name ((env_name)) \
  --file ((macos_url))
conda activate ((env_name))
conda config --env --set subdir osx-64
```

:::

:::{tab-item} macOS (Intel)

These instructions are for users older Intel-based Apple hardware (NOT M1, M2, etc).

```bash
conda env create \
  --name ((env_name)) \
  --file ((macos_url))
```

:::

:::::

### 4. Test your install

Finally, to verify things are working, run:

```bash
conda deactivate
conda activate ((env_name))
qiime info
```

## Using Docker

Steps 1-3 will guide you through installing `docker` and pulling the image for your selected _base distribution_.

### 1. Install docker

See [https://www.docker.com](https://www.docker.com) for instructions for your platform.

### 2. Download base image

Run the following command to pull the selected image:

```bash
docker pull quay.io/qiime2/((distro)):((epoch))
```

### 3. Test your install

Finally, to verify things are working, run:

```bash
docker run \
  -v $(pwd):/data \
  -it quay.io/qiime2/((distro)):((epoch)) \
  qiime info
```

This command mounts your current working directory as a volume to `/data` inside the container, then starts an interactive session (`-i`) with the command `qiime info` using the image `quay.io/qiime2/((distro)):((epoch))` (`-t`).
