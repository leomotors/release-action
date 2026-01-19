import { describe, expect, test } from "vitest";

import {
  getChangelog,
  getRecentVersion,
  getShortVersion,
  isPrerelease,
} from "../src/modules/utils/changelog.js";

describe("Reading Changelog", () => {
  test("Valid Changelog", async () => {
    const versions = ["5.0.0", "1.0.0"];

    for (const version of versions) {
      expect(
        await getChangelog("tests/__fixtures__/changelog.md", version),
      ).toMatchSnapshot();
    }
  });

  test("Invalid Changelog", async () => {
    expect(
      await getChangelog("tests/__fixtures__/changelog.md", "invalid version"),
    ).toBe("");
    expect(await getChangelog("invalid path", "1.2.3")).toBe("");
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

  test("Normal Case", () => {
    // Test cases are already short version

    versions.forEach((version) => {
      expect(getShortVersion(version)).toBe(version);
    });
  });

  test("With Prefix v", () => {
    const vPrefix = versions.map((v) => `v${v}`);

    vPrefix.forEach((version) => {
      expect(getShortVersion(version)).toBe(version.slice(1));
    });
  });

  test("With Package Name", () => {
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
  test("Normal Case", () => {
    expect(isPrerelease("1.0.2")).toBe(false);
    expect(isPrerelease("6.9.420")).toBe(false);
    expect(isPrerelease("6.9.420.177013")).toBe(false);

    expect(isPrerelease("6.9.420.177013-beta")).toBe(true);
  });

  test("Leading Zero", () => {
    expect(isPrerelease("0.9.420")).toBe(false);
    expect(isPrerelease("0.9.420.177013")).toBe(false);

    expect(isPrerelease("0.9.2-beta.4")).toBe(true);
  });
});

describe("getRecentVersion", () => {
  test("Normal Case", () => {
    expect(getRecentVersion(["1.0.0", "0.9.0"], "1.1.0")).toBe("1.0.0");
    expect(getRecentVersion(["2.0.0", "1.5.0", "1.0.0"], "2.1.0")).toBe(
      "2.0.0",
    );
  });

  test("Multiple Packages", () => {
    expect(
      getRecentVersion(
        ["@scope/pkgA@1.0.0", "@scope/pkgB@2.0.0", "@scope/pkgA@0.9.0"],
        "@scope/pkgA@1.1.0",
      ),
    ).toBe("@scope/pkgA@1.0.0");
    expect(
      getRecentVersion(
        [
          "@scope/pkgA@2.0.0",
          "@scope/pkgB@3.0.0",
          "@scope/pkgA@1.5.0",
          "@scope/pkgA@1.0.0",
        ],
        "@scope/pkgB@3.1.0",
      ),
    ).toBe("@scope/pkgB@3.0.0");
  });

  test("Mixed", () => {
    expect(
      getRecentVersion(["1.0.0", "@scope/pkgB@2.0.0", "0.9.0"], "1.1.0"),
    ).toBe("1.0.0");
    expect(
      getRecentVersion(
        [
          "@scope/pkgA@2.0.0",
          "3.0.0",
          "@scope/pkgA@1.5.0",
          "@scope/pkgA@1.0.0",
        ],
        "3.1.0",
      ),
    ).toBe("3.0.0");
    expect(
      getRecentVersion(
        [
          "@scope/pkgA@2.0.0",
          "3.0.0",
          "@scope/pkgA@1.5.0",
          "@scope/pkgA@1.0.0",
        ],
        "@scope/pkgA@2.1.0",
      ),
    ).toBe("@scope/pkgA@2.0.0");
  });

  test("Weird case but should work due to implementation details", () => {
    expect(
      getRecentVersion(
        ["special-week", "special-decade", "grand-decade"],
        "wonderhoy",
      ),
    ).toBe("special-week");

    const tc = ["a@x", "a@y", "b@x", "c@z", "b@y", "b@z", "a@z"];

    expect(getRecentVersion(tc, "a@xxx")).toBe("a@x");
    expect(getRecentVersion(tc, "b@xxx")).toBe("b@x");
    expect(getRecentVersion(tc, "c@xxx")).toBe("c@z");
  });
});
