import fsSync from "node:fs";
import fs from "node:fs/promises";

import { TaskResult } from "../types.js";

export async function getChangelog(
  path: string,
  version: string,
): Promise<TaskResult<string>> {
  if (!fsSync.existsSync(path)) {
    return {
      success: true,
      data: "",
    };
  }

  try {
    const lines = (await fs.readFile(path)).toString().split("\n");

    let body = "";

    let startlevel = 0;
    let started = false;

    for (const line of lines) {
      if (line.startsWith("#") && line.includes(version)) {
        startlevel = line.split("").filter((c) => c === "#").length;
      }

      if (startlevel) {
        if (
          line.startsWith("#".repeat(startlevel)) &&
          !line.startsWith("#".repeat(startlevel + 1)) &&
          started
        ) {
          return {
            success: true,
            data: body,
          };
        }
        body += line + "\n";
        started = true;
      }
    }

    return {
      success: true,
      data: body,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}

/**
 * Removing prefix v or leading package name from version string
 *
 * @param version Full version string
 */
export function getShortVersion(version: string) {
  if (version.startsWith("v")) {
    return version.slice(1);
  }

  return version.split("@").at(-1)!.replace(/^v/, "");
}

export function isPrerelease(version: string) {
  for (const kw of [
    "alpha",
    "beta",
    "dev",
    "pre",
    "rc",
    "insider",
    "next",
    "experi",
    "test",
  ])
    if (version.includes(kw)) return true;
  return false;
}
