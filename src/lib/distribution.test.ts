import { describe, expect, it } from "vitest";
import { createDistributionLinks } from "./distribution";

describe("createDistributionLinks", () => {
  it("默认生成上游 Release 链接", () => {
    const links = createDistributionLinks();

    expect(links.repositoryUrl).toBe("https://github.com/farion1231/cc-switch");
    expect(links.releasesUrl).toBe(
      "https://github.com/farion1231/cc-switch/releases",
    );
    expect(links.releaseUrlForVersion("3.19.2")).toBe(
      "https://github.com/farion1231/cc-switch/releases/tag/v3.19.2",
    );
    expect(links.releaseUrlForVersion("v3.19.2")).toBe(
      "https://github.com/farion1231/cc-switch/releases/tag/v3.19.2",
    );
  });

  it("fork 构建使用独立仓库和 tag 前缀", () => {
    const links = createDistributionLinks(
      "https://github.com/THQDDQHT/cc-switch/",
      "fork-v",
    );

    expect(links.repositoryUrl).toBe("https://github.com/THQDDQHT/cc-switch");
    expect(links.releaseUrlForVersion("3.19.2001")).toBe(
      "https://github.com/THQDDQHT/cc-switch/releases/tag/fork-v3.19.2001",
    );
    expect(links.releaseUrlForVersion("v3.19.2001")).toBe(
      "https://github.com/THQDDQHT/cc-switch/releases/tag/fork-v3.19.2001",
    );
    expect(links.releaseUrlForVersion("fork-v3.19.2001")).toBe(
      "https://github.com/THQDDQHT/cc-switch/releases/tag/fork-v3.19.2001",
    );
  });

  it("版本为空时回退到 Release 列表", () => {
    const links = createDistributionLinks(
      "https://github.com/THQDDQHT/cc-switch",
      "fork-v",
    );

    expect(links.releaseUrlForVersion()).toBe(links.releasesUrl);
    expect(links.releaseUrlForVersion("  ")).toBe(links.releasesUrl);
  });
});
