# Release Action

Personalized release action, successor of https://github.com/leomotors/auto-publish-release

## Basic Usage

### Create GitHub release

```yaml
on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest

    steps:
      ...

      - name: Create Release
        uses: leomotors/release-action@v6
        with:
          mode: release
          github-token: ${{ secrets.GITHUB_TOKEN }}
          tag: ${{ github.ref_name }}
          title: Application Name # Release title will be "Application Name vX.Y.Z"
          changelog-file: CHANGELOG.md # Default
```

### Monorepo Release

```yaml
on:
  push:
    tags:
      - '*@*.*.*'

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest

    steps:
      ...

      - name: Get Package Info
        uses: leomotors/release-action@v6
        id: packages-info
        with:
          mode: get-packages-info
          tag: ${{ github.ref_name }}
          packages-info-file: packages-info.yaml
        # In monorepo mode, it will only output the package location and
        # its info (title, changelog)

      # Do check or build based on information

      - name: Create Release
        uses: leomotors/release-action@v6
        with:
          mode: release
          github-token: ${{ secrets.GITHUB_TOKEN }}
          tag: ${{ github.ref_name }}$
          title: ${{ steps.packages-info.output.package-full-name }}$
          changelog-file: ${{ steps.packages-info.output.changelog-path }}$
```
