import fs from "node:fs/promises";

import YAML from "yaml";

import { PackagesInfo, packagesInfoSchema } from "../../schema/packagesInfo.js";
import { TaskResult } from "../../types.js";

export async function safeReadPackagesInfo(
  filePath: string,
): Promise<TaskResult<PackagesInfo>> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const parsedData = YAML.parse(data);
    const result = packagesInfoSchema.safeParse(parsedData);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to read packages info file: ${error}`,
    };
  }
}

export function getPackageNameAndVersion(tag: string) {
  if (!tag.includes("@")) {
    return {
      packageName: "",
      version: tag,
    };
  }

  const parts = tag.split("@");
  const packageName = parts.slice(0, -1).join("@");

  return {
    packageName,
    version: parts.at(-1)!,
  };
}
