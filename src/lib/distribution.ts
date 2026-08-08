const DEFAULT_REPOSITORY_URL = "https://github.com/farion1231/cc-switch";
const DEFAULT_RELEASE_TAG_PREFIX = "v";

export interface DistributionLinks {
  repositoryUrl: string;
  releasesUrl: string;
  releaseUrlForVersion: (version?: string | null) => string;
}

/**
 * 生成当前发行渠道使用的仓库与 Release 链接。
 *
 * 默认保持上游行为；fork 构建通过 Vite 环境变量注入自己的仓库和 tag 前缀。
 */
export function createDistributionLinks(
  repositoryUrl = DEFAULT_REPOSITORY_URL,
  releaseTagPrefix = DEFAULT_RELEASE_TAG_PREFIX,
): DistributionLinks {
  const normalizedRepositoryUrl =
    repositoryUrl.trim().replace(/\/+$/, "") || DEFAULT_REPOSITORY_URL;
  const normalizedTagPrefix =
    releaseTagPrefix.trim() || DEFAULT_RELEASE_TAG_PREFIX;
  const releasesUrl = `${normalizedRepositoryUrl}/releases`;

  return {
    repositoryUrl: normalizedRepositoryUrl,
    releasesUrl,
    releaseUrlForVersion: (version) => {
      const normalizedVersion = version?.trim() ?? "";
      if (!normalizedVersion) return releasesUrl;

      const tag = normalizedVersion.startsWith(normalizedTagPrefix)
        ? normalizedVersion
        : `${normalizedTagPrefix}${normalizedVersion.replace(/^v/, "")}`;

      return `${releasesUrl}/tag/${encodeURIComponent(tag)}`;
    },
  };
}

const distribution = createDistributionLinks(
  import.meta.env.VITE_CC_SWITCH_REPOSITORY_URL,
  import.meta.env.VITE_CC_SWITCH_RELEASE_TAG_PREFIX,
);

export const REPOSITORY_URL = distribution.repositoryUrl;
export const RELEASES_URL = distribution.releasesUrl;
export const releaseUrlForVersion = distribution.releaseUrlForVersion;
