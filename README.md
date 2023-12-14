# setup-cli-action

GitHub Action to set up the [Humanitec CLI](https://developer.humanitec.com/platform-orchestrator/cli/).


## Usage

```yaml
name: ci

on:
  push:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Humanitec CLI
        uses: humanitec/setup-cli-action@v1
      - run: humctl version

```

- Checkout the [Documentation](https://developer.humanitec.com/platform-orchestrator/cli/) on how to install the CLI.
- Checkout the [CLI Reference](https://developer.humanitec.com/platform-orchestrator/reference/cli-references/) for additional usage details.
