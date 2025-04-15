import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        "src/index.ts",
        "src/inputs.ts",
        "src/types.ts",
        "src/modules/getPackagesInfo.ts",
        "src/modules/release.ts",
      ],
    },
  },
});
