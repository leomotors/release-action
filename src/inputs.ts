import * as core from "@actions/core";

import { Inputs, inputSchema } from "./schema/inputs.js";
import { TaskResult } from "./types.js";

export function getInput() {
  return {
    githubToken: core.getInput("github-token") || undefined,
    tag: core.getInput("tag") || undefined,
    mode: core.getInput("mode") || undefined,
    title: core.getInput("title") || undefined,
    changelogFile: core.getInput("changelog-file") || undefined,
    packagesInfoFile: core.getInput("packages-info-file") || undefined,
    dryRun: core.getBooleanInput("dry-run"),
  };
}

export function getInputAndParse(): TaskResult<Inputs> {
  try {
    const input = getInput();

    return {
      data: inputSchema.parse(input),
      success: true as const,
    };
  } catch (error) {
    return {
      error,
      success: false as const,
    };
  }
}
