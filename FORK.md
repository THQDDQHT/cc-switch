# THQDDQHT Fork 发布与维护

本文件记录 `THQDDQHT/cc-switch` 的 macOS 自用发行流程。仓库中不得提交 updater 私钥、密码、GitHub token 或 Apple 凭据。

## 发行边界

- 仅发布 macOS Universal（`arm64` + `x86_64`）。
- 保持 `CFBundleIdentifier = com.ccswitch.desktop`，因此会原位替换官方版并复用现有数据；官方版与 fork 版不能并行安装。
- 使用 ad-hoc code signing（`signingIdentity = "-"`），不使用 Apple Developer ID，也不做 notarization。
- 应用内 updater 只信任本 fork 的公钥，并只访问本 fork 的 GitHub Release endpoint。

## 版本规则

Fork 发行版本使用三段数字：

```text
major.minor.(upstream_patch × 1000 + fork_revision)
```

示例：

- 上游 `3.19.2`，fork 第 1 版：`3.19.2001`
- 上游 `3.19.2`，fork 第 2 版：`3.19.2002`
- 上游 `3.19.3`，fork 第 1 版：`3.19.3001`

发行 tag 必须是 `fork-v<version>`，并与 `src-tauri/tauri.fork.conf.json` 的 `version` 完全一致。

`package.json` 和 `src-tauri/Cargo.toml` 保留上游 core version；用户可见版本、Info.plist 和 updater 比较使用 fork Tauri config 中的版本。

## Updater 密钥

本机文件：

- 私钥：`~/.tauri/cc-switch-fork.key`
- 公钥：`~/.tauri/cc-switch-fork.key.pub`
- 密码：macOS Keychain，service 为 `cc-switch-fork-updater`，account 为 `THQDDQHT/cc-switch`

私钥和密码必须一起备份到安全的离线密码库。丢失其中任意一个，现有安装将无法验证后续更新。不要随意轮换 updater key；若必须轮换，应先用旧私钥发布一个内置新公钥的过渡版本。

GitHub Environment 名为 `fork-release`，只需要：

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

安全写入方式：

```sh
gh api --method PUT repos/THQDDQHT/cc-switch/environments/fork-release

gh secret set TAURI_SIGNING_PRIVATE_KEY \
  --repo THQDDQHT/cc-switch \
  --env fork-release \
  < ~/.tauri/cc-switch-fork.key

security find-generic-password \
  -a 'THQDDQHT/cc-switch' \
  -s 'cc-switch-fork-updater' \
  -w | gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD \
    --repo THQDDQHT/cc-switch \
    --env fork-release
```

不要把 Keychain 查询结果单独打印到终端或保存到普通文件。

## 本地 Fork 构建

```sh
pnpm dev:fork
pnpm build:fork
```

这两个命令会注入 fork 仓库 URL、`fork-v` tag 前缀、Rust fallback Release URL，并合并 `src-tauri/tauri.fork.conf.json`。`build:fork` 还会关闭 release thin LTO 并禁止 strip 符号，以规避 Rust 1.95 在 macOS 27 上的两个 release 构建问题：thin LTO 下继承的 `phf_macros 0.10` 编译失败，以及 `strip = "symbols"` 破坏 proc-macro dylib 导致 “can't find crate” 错误（rust-lang/rust#157750）。`fork-release.yml` 顶层 env 也带相同覆盖。原有 `pnpm dev` / `pnpm build` 仍保持上游默认行为。

## 发布

1. 同步代码并运行完整测试。
2. 更新 `src-tauri/tauri.fork.conf.json` 中的 fork version。
3. 提交并 push `main`。
4. 创建并只推送对应 tag：

   ```sh
   git tag fork-v3.19.2001
   git push origin fork-v3.19.2001
   ```

5. `.github/workflows/fork-release.yml` 会构建 macOS Universal app，验证 ad-hoc 签名和双架构，生成 updater artifact、签名、ZIP 与 `latest.json`。
6. workflow 先创建 draft Release；只有资产上传并回读验证成功后才发布为 stable/latest。

不要使用 `git push --tags`，避免误推上游 `v*` tag 并触发不适用于此 fork 的官方发布流程。

## 手动安装与 Gatekeeper

Release ZIP 中的应用没有 Apple notarization。浏览器下载后若 macOS 阻止启动，请先确认文件确实来自 `THQDDQHT/cc-switch`，再执行：

```sh
xattr -dr com.apple.quarantine "/Applications/CC Switch.app"
```

这不会把 ad-hoc 签名变成 Developer ID 签名，也不代表应用已通过 Apple 公证。

## 同步上游

首次添加 remote：

```sh
git remote add upstream https://github.com/farion1231/cc-switch.git
```

以后定期执行：

```sh
git fetch upstream --tags
git switch main
git merge upstream/main
```

解决冲突并通过测试后，提升 fork version、push `main`，再创建新的 `fork-v<version>` tag。默认不使用破坏性的强推。
