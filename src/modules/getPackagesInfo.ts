import * as core from "@actions/core";

import { GetPackageInfoModeInputs } from "../schema/inputs.js";
import {
  getPackageNameAndVersion,
  safeReadPackagesInfo,
} from "./utils/readPackagesInfo.js";

export async function getPackagesInfo(inputs: GetPackageInfoModeInputs) {
  const packagesInfoFile = inputs.packagesInfoFile;

  const packagesInfoResult = await safeReadPackagesInfo(packagesInfoFile);

  if (!packagesInfoResult.success) {
    core.setFailed(`${packagesInfoResult.error}`);
    return;
  }

  const packagesInfo = packagesInfoResult.data;
  const { packageName: targetPackage, version } = getPackageNameAndVersion(
    inputs.tag,
  );

  const packageInfo = packagesInfo.packages.filter(
    (pkg) => pkg.name === targetPackage,
  );

  if (packageInfo.length === 0) {
    core.setFailed(`Package "${targetPackage}" not found in packages info.`);
    return;
  }

  if (packageInfo.length > 1) {
    core.setFailed(
      `Multiple packages found with the name "${targetPackage}". Please ensure unique package names.`,
    );
    return;
  }

  core.setOutput("package-name", targetPackage);
  core.setOutput("package-full-name", packageInfo[0].fullName);
  core.setOutput("package-version", version);
  core.setOutput("package-path", packageInfo[0].packagePath);
  core.setOutput(
    "changelog-path",
    packageInfo[0].changelogPath
      ? packageInfo[0].changelogPath
      : `${packageInfo[0].packagePath}/CHANGELOG.md`,
  );
}
