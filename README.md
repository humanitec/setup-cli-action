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
        with:
          # Check https://github.com/humanitec/cli/releases for available versions
          version: '0.17.0' # Can be an exact version or a semver range https://github.com/npm/node-semver#ranges
          token: ${{ secrets.GITHUB_TOKEN }} # Required if a range is specified

      - run: humctl version
```

- Checkout the [Documentation](https://developer.humanitec.com/platform-orchestrator/cli/) on how to install the CLI.
- Checkout the [CLI Reference](https://developer.humanitec.com/platform-orchestrator/reference/cli-references/) for additional usage details.

## Development

**Requirements:**

- [asdf](https://asdf-vm.com/) or [mise](https://mise.jdx.dev/) for version
  management
- tool versions: [`.tool-versions`](.tool-versions)

```bash
mise install
npm ci
```

**Testing:**

```bash
npm test              # run jest tests
npm run lint          # eslint
npm run format:write  # prettier write
npm run bundle        # format + build dist/index.js (esbuild)
```

> `dist/` is committed. Run `npm run bundle` and commit `dist/` before pushing —
> the `check-dist` workflow fails if `dist/` is stale.
