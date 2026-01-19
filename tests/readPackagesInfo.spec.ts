import { describe, expect, it } from "vitest";

import { getPackageNameAndVersion } from "../src/modules/utils/parseTag";
import { safeReadPackagesInfo } from "../src/modules/utils/readPackagesInfo";

describe("safeReadPackagesInfo", () => {
  it("Valid Case", async () => {
    expect(
      await safeReadPackagesInfo("tests/__fixtures__/pkg-info-success-1.yaml"),
    ).toMatchSnapshot();
  });

  it("Parse Fail Case", async () => {
    expect(
      await safeReadPackagesInfo("tests/__fixtures__/pkg-info-fail-1.yaml"),
    ).toMatchSnapshot();
  });

  it("Invalid File Case", async () => {
    expect(
      await safeReadPackagesInfo("tests/__fixtures__/pkg-info-fail-1.yml"),
    ).toMatchSnapshot();
  });
});

describe("getPackageNameAndVersion", () => {
  it("Normal Case", () => {
    expect(getPackageNameAndVersion("1.2.3")).toStrictEqual({
      packageName: "",
      version: "1.2.3",
    });

    expect(getPackageNameAndVersion("1.2.3-rc.1")).toStrictEqual({
      packageName: "",
      version: "1.2.3-rc.1",
    });

    expect(getPackageNameAndVersion("package@1.2.3")).toStrictEqual({
      packageName: "package",
      version: "1.2.3",
    });

    expect(getPackageNameAndVersion("package@1.2.3-rc.1")).toStrictEqual({
      packageName: "package",
      version: "1.2.3-rc.1",
    });

    expect(getPackageNameAndVersion("package/path@1.2.3")).toStrictEqual({
      packageName: "package/path",
      version: "1.2.3",
    });

    expect(getPackageNameAndVersion("package/path/nest@1.2.3")).toStrictEqual({
      packageName: "package/path/nest",
      version: "1.2.3",
    });

    expect(getPackageNameAndVersion("@package/path@1.2.3")).toStrictEqual({
      packageName: "@package/path",
      version: "1.2.3",
    });

    expect(getPackageNameAndVersion("@package/path/nest@1.2.3")).toStrictEqual({
      packageName: "@package/path/nest",
      version: "1.2.3",
    });
  });
});
