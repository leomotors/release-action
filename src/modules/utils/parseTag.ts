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
