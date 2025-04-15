import * as core from "@actions/core";

import { getInputAndParse } from "./inputs.js";
import { getPackagesInfo } from "./modules/getPackagesInfo.js";
import { release } from "./modules/release.js";

export async function run() {
  const result = getInputAndParse();

  if (!result.success) {
    core.setFailed(`Invalid input: ${result.error}`);
    return;
  }

  const inputs = result.data;

  if (inputs.mode === "release") {
    await release(inputs);
  } else if (inputs.mode === "get-packages-info") {
    await getPackagesInfo(inputs);
  }
}

run().catch((error) => {
  core.setFailed(`Unhandled error: ${error}`);
});
