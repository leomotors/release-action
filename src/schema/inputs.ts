import { z } from "zod";

export const tagRegex =
  /^(?:@?[\w\-/]+@)?v?\d+\.\d+\.\d+(?:-[a-zA-Z]+(?:\.\d+)?)?$/;

const tagSchema = z.string().regex(tagRegex);

const baseInputSchema = z.object({
  tag: tagSchema,
});

const releaseModeSchema = z
  .object({
    githubToken: z.string().nonempty(),
    title: z.string().nonempty().default("Release"),
    changelogFile: z.string().nonempty().default("CHANGELOG.md"),
    dryRun: z.boolean().default(false),
    mode: z.literal("release"),
  })
  .merge(baseInputSchema);

const getPackageInfoModeSchema = z
  .object({
    packagesInfoFile: z.string().nonempty().default("packages-info.yaml"),
    mode: z.literal("get-packages-info"),
  })
  .merge(baseInputSchema);

export const inputSchema = z.discriminatedUnion("mode", [
  releaseModeSchema,
  getPackageInfoModeSchema,
]);

export type Inputs = z.infer<typeof inputSchema>;
export type ReleaseModeInputs = z.infer<typeof releaseModeSchema>;
export type GetPackageInfoModeInputs = z.infer<typeof getPackageInfoModeSchema>;
