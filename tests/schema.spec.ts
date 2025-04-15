import { describe, expect, it } from "vitest";
import type { ZodTypeAny } from "zod";

import { inputSchema, tagRegex } from "../src/schema/inputs.js";
import { packagesInfoSchema } from "../src/schema/packagesInfo.js";

const createExpectPass =
  (schema: ZodTypeAny) =>
  (input: unknown, checkSnapshot = true, checkEqual = false) => {
    expect(() => schema.parse(input)).not.toThrow();

    if (checkSnapshot) {
      expect(schema.parse(input)).toMatchSnapshot();
    }

    if (checkEqual) {
      expect(schema.parse(input)).toEqual(input);
    }
  };

const expectInputPass = createExpectPass(inputSchema);

const expectPkgPass = createExpectPass(packagesInfoSchema);

const createExpectFail =
  (schema: ZodTypeAny) =>
  (input: unknown, checkSnapshot = true) => {
    if (checkSnapshot) {
      expect(() => schema.parse(input)).toThrowErrorMatchingSnapshot();
    } else {
      expect(() => schema.parse(input)).toThrow();
    }
  };

const expectInputFail = createExpectFail(inputSchema);
const expectPkgFail = createExpectFail(packagesInfoSchema);

describe("Input Schema", () => {
  it("Valid Input: Release Mode", () => {
    // Simple Release
    expectInputPass({
      mode: "release",
      githubToken: "ghp_123",
      tag: "v1.0.0",
    });

    // Release with Title
    expectInputPass({
      mode: "release",
      githubToken: "ghp_123",
      tag: "v1.0.0",
      title: "Release Title",
    });

    // Release with Changelog
    expectInputPass({
      mode: "release",
      githubToken: "ghp_123",
      tag: "v1.0.0",
      changelogFile: "CHANGELOG-real.md",
    });

    // Dry Run
    expectInputPass({
      mode: "release",
      githubToken: "ghp_123",
      tag: "v1.0.0",
      dryRun: true,
    });
  });

  it("Valid Input: Get Packages Info Mode", () => {
    // Simple Get Packages Info
    expectInputPass({
      mode: "get-packages-info",
      githubToken: "ghp_123",
      tag: "v1.0.0",
    });

    // Override
    expectInputPass({
      mode: "get-packages-info",
      githubToken: "ghp_123",
      tag: "v1.0.0",
      packagesInfoFile: "packages-info.lmao",
    });
  });

  it("Invalid Input: No mode", () => {
    // Empty
    expectInputFail({});

    // Random Field
    expectInputFail({
      ruby: "chocomint",
      ayumu: "strawberry flavor",
      shiki: "cookie & cream",
    });

    // No Mode
    expectInputFail({
      githubToken: "ghp_123",
      tag: "v1.0.0",
    });

    // Invalid Mode
    expectInputFail({
      mode: "gx",
      githubToken: "ghp_123",
      tag: "v1.0.0",
    });
  });

  it("Invalid Input: Release Mode", () => {
    // No Tag
    expectInputFail({
      mode: "release",
      githubToken: "ghp_123",
    });

    // Empty String
    expectInputFail({
      mode: "release",
      githubToken: "ghp_123",
      tag: "",
    });
  });

  it("Invalid Input: Get Packages Info Mode", () => {
    // No Tag
    expectInputFail({
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

describe("Packages Info Schema", () => {
  it("Valid Case", () => {
    const ep = (input: unknown) => expectPkgPass(input, false, true);

    ep({
      packages: [
        {
          name: "hello",
          packagePath: "apps/hello",
        },
      ],
    });

    ep({
      packages: [
        {
          name: "hello",
          packagePath: "apps/hello",
          changelogPath: "apps/hello/not-changelog.md",
        },
      ],
    });

    ep({
      packages: [
        {
          name: "",
          packagePath: "apps/default",
        },
      ],
    });

    ep({
      packages: [
        {
          name: "hello",
          packagePath: "apps/hello",
        },
        {
          name: "world",
          fullName: "ワールド",
          packagePath: "apps/world",
          changelogPath: "apps/world/not-changelog.md",
        },
      ],
    });
  });

  it("Invalid Case", () => {
    expectPkgFail({
      name: "hello",
      packagePath: "apps/hello",
    });

    expectPkgFail({
      packages: [],
    });

    expectPkgFail({
      packages: [
        {
          name: "valid",
          packagePath: "apps/valid",
        },
        {
          name: "invalid",
          packagePath: "",
        },
      ],
    });

    expectPkgFail({
      packages: [
        {
          name: "valid",
          packagePath: "apps/valid",
        },
        {
          name: "invalid",
        },
      ],
    });

    expectPkgFail({
      packages: [
        {
          name: "valid",
          packagePath: "apps/valid",
        },
        {
          name: "invalid",
          packagePath: "apps/invalid",
          changelogPath: "",
        },
      ],
    });
  });
});
