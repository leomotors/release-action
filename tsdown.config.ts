import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  minify: false, // No minification needed for CLI
  sourcemap: true,
  clean: true, // Clean output folder before build
  platform: "node",
  target: "node24", // Target latest Node.js version
});
