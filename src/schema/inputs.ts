import { z } from "zod";

export const tagRegex =
  /^(?:@?[\w\-/]+@)?v?\d+\.\d+\.\d+(?:-[a-zA-Z]+(?:\.\d+)?)?$/;

const tagSchema = z.string().regex(tagRegex);

const baseInputSchema = z.object({
  // Semantic version tag in release mode or package name @ version for get-packages-info mode
  tag: tagSchema,
});

const releaseModeSchema = z
  .object({
    mode: z.literal("release"),
    // Uses secrets.GITHUB_TOKEN
    githubToken: z.string().nonempty(),
    // Title of the release
    title: z.string().nonempty().default("Release"),
    // Changelog file location (optional)
    changelogFile: z.string().nonempty().default("CHANGELOG.md"),
    // Prints the request body to the console without sending it
    dryRun: z.boolean().default(false),
  })
  .merge(baseInputSchema);

const getPackageInfoModeSchema = z
  .object({
    mode: z.literal("get-packages-info"),
    packagesInfoFile: z.string().nonempty().default("packages-info.yaml"),
  })
  .merge(baseInputSchema);

export const inputSchema = z.discriminatedUnion("mode", [
  releaseModeSchema,
  getPackageInfoModeSchema,
]);

export type Inputs = z.infer<typeof inputSchema>;
export type ReleaseModeInputs = z.infer<typeof releaseModeSchema>;
export type GetPackageInfoModeInputs = z.infer<typeof getPackageInfoModeSchema>;
