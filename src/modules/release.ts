import * as core from "@actions/core";
import * as github from "@actions/github";

import { ReleaseModeInputs } from "../schema/inputs.js";
import {
  getChangelog,
  getRecentVersion,
  getShortVersion,
  isPrerelease,
} from "./utils/changelog.js";

export async function release(inputs: ReleaseModeInputs) {
  const shortVersion = getShortVersion(inputs.tag);
  const isPrelease = isPrerelease(shortVersion);

  const releaseTitle = `${inputs.title} ${shortVersion}`;

  const octokit = github.getOctokit(inputs.githubToken);
  const { owner, repo } = github.context.repo;

  const allTags = (
    await octokit.rest.repos.listTags({
      owner,
      repo,
      per_page: 100,
    })
  ).data.map((tag) => tag.name);

  const changelogBody = await getChangelog(inputs.changelogFile, shortVersion);

  const recentVersion = getRecentVersion(allTags, inputs.tag);

  if (!changelogBody) {
    core.info("Changelog is empty");
  }

  const finalChangelog = `${changelogBody}
  
**Full Changelog**: https://github.com/${owner}/${repo}/compare/${recentVersion}...${inputs.tag}`;

  const requestBody = {
    owner,
    repo,
    tag_name: inputs.tag,
    name: releaseTitle,
    body: finalChangelog,
    prerelease: isPrelease,
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
