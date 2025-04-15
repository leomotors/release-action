import { z } from "zod";

const packageInfo = z.object({
  // to match with the tag
  name: z.string(),
  // defaults to `name`
  fullName: z.string().optional(),
  // relative path from the root of the repository, ex: apps/web
  packagePath: z.string().nonempty(),
  // defaults to `packagePath + "/CHANGELOG.md"`
  changelogPath: z.string().nonempty().optional(),
});

export const packagesInfoSchema = z.object({
  packages: z.array(packageInfo).nonempty(),
});

export type PackageInfo = z.infer<typeof packageInfo>;
export type PackagesInfo = z.infer<typeof packagesInfoSchema>;
