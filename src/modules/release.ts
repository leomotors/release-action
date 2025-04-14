import * as core from "@actions/core";
import * as github from "@actions/github";

import { ReleaseModeInputs } from "../schema.js";
import { getChangelog, getShortVersion, isPrerelease } from "./changelog.js";

export async function release(inputs: ReleaseModeInputs) {
  const shortVersion = getShortVersion(inputs.tag);
  const isPrelease = isPrerelease(shortVersion);

  const changelogBody = await getChangelog(inputs.changelogFile, shortVersion);

  if (!changelogBody) {
    core.info("Changelog is empty");
  }

  const releaseTitle = `${inputs.title} ${shortVersion}`;

  const octokit = github.getOctokit(inputs.githubToken);
  const { owner, repo } = github.context.repo;

  const requestBody = {
    owner,
    repo,
    tag_name: inputs.tag,
    name: releaseTitle,
    body: changelogBody,
    prerelease: isPrelease,
    generate_release_notes: true,
  };

  if (inputs.dryRun) {
    core.info("Dry run mode enabled");
    core.info(`Request body: ${JSON.stringify(requestBody, null, 2)}`);
    return;
  } else {
    await octokit.request("POST /repos/{owner}/{repo}/releases", requestBody);
    core.info(`Release created: ${releaseTitle}`);
  }
}
