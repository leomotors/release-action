import { describe, expect, it } from "vitest";

import {
  getChangelog,
  getShortVersion,
  isPrerelease,
} from "../src/modules/changelog.js";

describe("Reading Changelog", () => {
  it("Valid Changelog", async () => {
    const versions = ["5.0.0", "1.0.0"];

    for (const version of versions) {
      expect(
        await getChangelog("tests/__fixtures__/changelog.md", version),
      ).toMatchSnapshot();
    }
  });

  it("Invalid Changelog", async () => {
    const emptyOutput = {
      success: true,
      data: "",
    };

    expect(
      await getChangelog("tests/__fixtures__/changelog.md", "invalid version"),
    ).toStrictEqual(emptyOutput);
    expect(await getChangelog("invalid path", "1.2.3")).toStrictEqual(
      emptyOutput,
    );
  });
});

describe("Short Version", () => {
  const versions = [
    "0.0.0",
    "1.2.3",
    "1.2.3-rc.1",
    "4.5.6-beta.1",
    "3.0.4-alpha.1",
    "5.0.0",
  ];

  it("Normal Case", () => {
    // Test cases are already short version

    versions.forEach((version) => {
      expect(getShortVersion(version)).toBe(version);
    });
  });

  it("With Prefix v", () => {
    const vPrefix = versions.map((v) => `v${v}`);

    vPrefix.forEach((version) => {
      expect(getShortVersion(version)).toBe(version.slice(1));
    });
  });

  it("With Package Name", () => {
    const testcases = [
      ["@scope/package@1.2.3", "1.2.3"],
      ["@scope/package@1.2.3-rc.1", "1.2.3-rc.1"],
      ["@scope/package@4.5.6-beta.1", "4.5.6-beta.1"],
      ["package@3.0.4-alpha.1", "3.0.4-alpha.1"],
      ["package@5.0.0", "5.0.0"],
      ["package@0.0.0", "0.0.0"],
      ["package@1.2.3", "1.2.3"],
      ["package@1.2.3-rc.1", "1.2.3-rc.1"],
      ["package@v1.2.3-rc.1", "1.2.3-rc.1"],
    ];

    testcases.forEach(([input, output]) => {
      expect(getShortVersion(input)).toBe(output);
    });
  });
});

describe("isPrerelease", () => {
  it("Normal Case", () => {
    expect(isPrerelease("1.0.2")).toBe(false);
    expect(isPrerelease("6.9.420")).toBe(false);
    expect(isPrerelease("6.9.420.177013")).toBe(false);

    expect(isPrerelease("6.9.420.177013-beta")).toBe(true);
  });

  it("Leading Zero", () => {
    expect(isPrerelease("0.9.420")).toBe(false);
    expect(isPrerelease("0.9.420.177013")).toBe(false);

    expect(isPrerelease("0.9.2-beta.4")).toBe(true);
  });
});
