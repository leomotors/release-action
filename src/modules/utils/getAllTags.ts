import * as core from "@actions/core";
import * as github from "@actions/github";

export async function getAllTags(
  octokit: ReturnType<typeof github.getOctokit>,
) {
  const { owner, repo } = github.context.repo;

  const allTags = [];
  let page = 1;

  while (true) {
    const result = await octokit.rest.repos.listTags({
      owner,
      repo,
      per_page: 100,
      page,
    });
    const tags = result.data.map((tag) => tag.name);
    allTags.push(...tags);

    if (tags.length < 100) {
      break;
    }
    page += 1;

    if (page >= 100) {
      // Safety break to avoid infinite loops
      core.info("Reached maximum page limit while fetching tags. (100 Pages)");
      break;
    }
  }

  return allTags;
}
