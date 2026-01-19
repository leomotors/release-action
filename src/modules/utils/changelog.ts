import fsSync from "node:fs";
import fs from "node:fs/promises";

export async function getChangelog(path: string, version: string) {
  if (!fsSync.existsSync(path)) {
    return "";
  }
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
        return body;
      }
      body += line + "\n";
      started = true;
    }
  }

  return body;
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

/**
 * Normalize version string by removing package prefix and 'v' prefix
 */
function normalizeVersion(tag: string): string {
  // Remove package prefix (everything before last @)
  const lastAtIndex = tag.lastIndexOf("@");
  const version = lastAtIndex >= 0 ? tag.slice(lastAtIndex + 1) : tag;
  // Remove 'v' prefix
  return version.startsWith("v") ? version.slice(1) : version;
}

/**
 * Extract package prefix from tag (everything before last @, including @)
 */
function getPackagePrefix(tag: string): string {
  const lastAtIndex = tag.lastIndexOf("@");
  return lastAtIndex >= 0 ? tag.slice(0, lastAtIndex + 1) : "";
}

/**
 * Compare two version strings semantically
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2, null if not comparable
 */
function compareVersions(v1: string, v2: string): number | null {
  const v1Normalized = normalizeVersion(v1);
  const v2Normalized = normalizeVersion(v2);

  // Check if both are valid version strings (contain numbers and dots)
  const versionPattern = /^\d+(\.\d+)*(-.*)?$/;
  if (
    !versionPattern.test(v1Normalized) ||
    !versionPattern.test(v2Normalized)
  ) {
    return null;
  }

  // Split into parts and compare
  const parts1 = v1Normalized.split(/[.-]/);
  const parts2 = v2Normalized.split(/[.-]/);

  const maxLength = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLength; i++) {
    const part1 = parts1[i] || "0";
    const part2 = parts2[i] || "0";

    // Try to parse as number
    const num1 = parseInt(part1, 10);
    const num2 = parseInt(part2, 10);

    if (!isNaN(num1) && !isNaN(num2)) {
      if (num1 < num2) return -1;
      if (num1 > num2) return 1;
    } else {
      // String comparison for non-numeric parts (like alpha, beta, etc.)
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
  }

  return 0;
}

/**
 * Find the most recent version in `allTags` that belongs to the same package as `newTag`
 * and is semantically less than `newTag`. Treats versions with and without 'v' prefix as equivalent.
 * Safely handles non-version tags by ignoring them.
 *
 * @param allTags - Array of all tags (not necessarily sorted)
 * @param newTag - The new tag to compare against
 * @returns The most recent previous version, or undefined if none exists
 */
export function getRecentVersion(
  allTags: string[],
  newTag: string,
): string | undefined {
  const newPackagePrefix = getPackagePrefix(newTag);

  // Filter tags with the same package prefix and compare versions
  let bestMatch: string | undefined = undefined;

  for (const tag of allTags) {
    // Skip if different package
    if (getPackagePrefix(tag) !== newPackagePrefix) {
      continue;
    }

    // Skip if it's the same tag
    if (normalizeVersion(tag) === normalizeVersion(newTag)) {
      continue;
    }

    // Compare versions
    const comparison = compareVersions(tag, newTag);

    // Skip if not comparable (non-version tag) or not less than newTag
    if (comparison === null || comparison >= 0) {
      continue;
    }

    // Check if this is better than current best match
    if (bestMatch === undefined) {
      bestMatch = tag;
    } else {
      const comparisonWithBest = compareVersions(tag, bestMatch);
      if (comparisonWithBest !== null && comparisonWithBest > 0) {
        bestMatch = tag;
      }
    }
  }

  return bestMatch;
}
