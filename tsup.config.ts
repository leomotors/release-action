import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "cjs", // Output CJS because ESM does not work 😡
  minify: false, // No minification needed for CLI
  sourcemap: true,
  clean: true, // Clean output folder before build
  platform: "node",
  target: "node20", // Target latest Node.js version
});
