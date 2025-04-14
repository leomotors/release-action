import { describe, expect, it } from "vitest";

import { inputSchema, tagRegex } from "../src/schema.js";

function expectPass(input: unknown, checkSnapshot = true) {
  expect(() => inputSchema.parse(input)).not.toThrow();

  if (checkSnapshot) {
    expect(inputSchema.parse(input)).toMatchSnapshot();
  }
}

function expectFail(input: unknown, checkSnapshot = true) {
  if (checkSnapshot) {
    expect(() => inputSchema.parse(input)).toThrowErrorMatchingSnapshot();
  } else {
    expect(() => inputSchema.parse(input)).toThrow();
  }
}

describe("Input Schema", () => {
  it("Valid Input: Release Mode", () => {
    // Simple Release
    expectPass({
      mode: "release",
      githubToken: "ghp_123",
      tag: "v1.0.0",
    });

    // Release with Title
    expectPass({
      mode: "release",
      githubToken: "ghp_123",
      tag: "v1.0.0",
      title: "Release Title",
    });

    // Release with Changelog
    expectPass({
      mode: "release",
      githubToken: "ghp_123",
      tag: "v1.0.0",
      changelogFile: "CHANGELOG-real.md",
    });

    // Dry Run
    expectPass({
      mode: "release",
      githubToken: "ghp_123",
      tag: "v1.0.0",
      dryRun: true,
    });
  });

  it("Valid Input: Get Packages Info Mode", () => {
    // Simple Get Packages Info
    expectPass({
      mode: "get-packages-info",
      githubToken: "ghp_123",
      tag: "v1.0.0",
    });

    // Override
    expectPass({
      mode: "get-packages-info",
      githubToken: "ghp_123",
      tag: "v1.0.0",
      packagesInfoFile: "packages-info.lmao",
    });
  });

  it("Invalid Input: No mode", () => {
    // Empty
    expectFail({});

    // Random Field
    expectFail({
      ruby: "chocomint",
      ayumu: "strawberry flavor",
      shiki: "cookie & cream",
    });

    // No Mode
    expectFail({
      githubToken: "ghp_123",
      tag: "v1.0.0",
    });

    // Invalid Mode
    expectFail({
      mode: "gx",
      githubToken: "ghp_123",
      tag: "v1.0.0",
    });
  });

  it("Invalid Input: Release Mode", () => {
    // No Tag
    expectFail({
      mode: "release",
      githubToken: "ghp_123",
    });

    // Empty String
    expectFail({
      mode: "release",
      githubToken: "ghp_123",
      tag: "",
    });
  });

  it("Invalid Input: Get Packages Info Mode", () => {
    // No Tag
    expectFail({
      mode: "get-packages-info",
      githubToken: "ghp_123",
    });
  });
});

describe("Tag Schema", () => {
  it("Valid Tag", () => {
    const tags = [
      "v1.0.0",
      "v1.2.3",
      "1.2.3",
      "1.2.3-rc",
      "1.2.3-rc.1",
      "4.5.6-beta.1",
      "3.0.4-alpha.1",
      "5.0.0",
      "0.0.0",
      "@package/nest/anothernest@6.9.0",
      "@package/nest/anothernest@6.9.0-rc.1",
      "@package/nest@6.9.0-beta.1",
      "package@6.9.0-alpha.1",
    ];

    tags.forEach((tag) => {
      expect(tagRegex.test(tag)).toBeTruthy();
    });
  });

  it("Invalid Tag", () => {
    const tags = [
      "1.2.3-rc.",
      "1.2.3-rc..1",
      "1.2.3-rc..",
      "1.2.3-rc..1.",
      "v1.2.3-rc.",
      "v1.2.3-rc..1",
      "v1.2.3-rc..",
      "v1.2.3-rc..1.",
      "@@v1.2.3",
      "@v1.2.3",
      "1.2",
      "1",
      "",
      "@",
    ];

    tags.forEach((tag) => {
      expect(tagRegex.test(tag)).toBeFalsy();
    });
  });
});
