# Release Action

Personalized release action, successor of https://github.com/leomotors/auto-publish-release

## Basic Usage

Create GitHub release

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
        uses: leomotors/release-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          tag: ${{ github.ref_name }}
          title: Application Name # Release title will be "Application Name vX.Y.Z"
          changelog-file: CHANGELOG.md # Default
```

Create GitHub Release then publish package or application

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

      # Do basic checks

      - name: Create Release
        uses: leomotors/release-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          tag: ${{ github.ref_name }}
          title: Application Name # Release title will be "Application Name vX.Y.Z"
          changelog-file: CHANGELOG.md # Default

      # Do npm or docker release etc.
```

Monorepo Release

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
        uses: leomotors/release-action@v1
        id: packages-info
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          tag: ${{ github.ref_name }}
          packages-info-file: packages-info.yaml # Must specify to enable monorepo mode
        # In monorepo mode, it will only output the package location and
        # its info (title, changelog)

      # Do check based on information

      - name: Get Package Info
        uses: leomotors/release-action@v1
        id: packages-info
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          tag: ${{ github.ref_name }}
          title: ${{ steps.packages-info.output.title }}$
          changelog-file: ${{ steps.packages-info.output.changelog }}$
```
