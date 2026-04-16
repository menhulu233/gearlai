# GitHub Auto-Release & Auto-Update Design

## Overview

将项目的版本发布流程迁移至 GitHub Actions，实现：

- **CI/CD**: push tag 时自动构建并发布安装包到 GitHub Releases
- **Auto-Update**: 客户端从 GitHub Releases API 获取版本信息，直接下载安装包更新

## Architecture

### CI/CD Flow

```
git tag v0.2.4
git push --tags
  → GitHub Actions 触发
    → 读取 package.json.version = "0.2.4"
    → npm run dist:win  (Windows)
    → npm run dist:mac  (macOS universal)
    → npm run dist:linux (Linux AppImage + deb)
    → 创建/更新 GitHub Release (tag=v0.2.4, title="GearlAI v0.2.4")
    → 上传各平台安装包作为 release assets
```

### Client Update Flow (Existing, Minimal Changes)

```
客户端启动 / 定时轮询
  → GET https://api.github.com/repos/{owner}/{repo}/releases/latest
  → 解析 JSON: tag_name, name, body (changelog), assets[]
  → 比较版本号 vs currentVersion
  → 若有新版本: 展示更新弹窗，用户确认后
    → downloadUpdate(asset.browser_download_url)
    → installUpdate(downloadedFile)
```

## Implementation Details

### 1. GitHub Actions Workflow

**File**: `.github/workflows/release.yml` (新建)

```yaml
on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        include:
          - os: windows-latest
            build_cmd: npm run dist:win
            asset_pattern: "release/GearlAI-*-x64-setup.exe"
          - os: macos-latest
            build_cmd: npm run dist:mac:universal
            asset_pattern: "release/GearlAI-*.dmg"
          - os: ubuntu-latest
            build_cmd: npm run dist:linux
            asset_pattern: "release/GearlAI-*amd64.AppImage"
            asset_pattern2: "release/GearlAI-*amd64.deb"
```

**关键点**:
- Trigger: 仅 `tags matching v*.*.*`
- 从 `package.json` 动态读取版本号
- 三个平台并行构建
- asset 命名需与 `endpoints.ts` 中解析逻辑一致

### 2. Client Update Source Migration

**File**: `src/renderer/services/endpoints.ts`

修改 `getUpdateCheckUrl()`:

```typescript
// 旧 (内部 API)
export const getUpdateCheckUrl = () => isTestMode()
  ? 'http://localhost:18000/openapi/get/luna/hardware/gearlai/test/update'
  : 'http://localhost:18000/openapi/get/luna/hardware/gearlai/prod/update'

// 新 (GitHub Releases API)
const GITHUB_OWNER = 'gearlai'          // TODO: 确认仓库 owner
const GITHUB_REPO = 'gearlai'

export const getUpdateCheckUrl = () =>
  `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`
```

**File**: `src/renderer/services/appUpdate.ts`

适配 GitHub API 响应格式:

```typescript
// GitHub API 响应字段映射
type GithubReleaseResponse = {
  tag_name: string;        // "v0.2.4"
  name: string;            // "GearlAI v0.2.4"
  body: string;            // markdown changelog
  published_at: string;    // "2026-04-16T..."
  assets: Array<{
    name: string;           // "GearlAI-0.2.4-x64-setup.exe"
    browser_download_url: string;
  }>;
};
```

`getPlatformDownloadUrl` 需根据 GitHub assets 列表查找匹配的下载链接。

### 3. Windows Asset 命名约束

GitHub Actions 构建产出的 Windows 安装包命名示例:
- `GearlAI-0.2.4-x64-setup.exe`

`appUpdate.ts` 中按以下优先级匹配:
1. 平台: `win32` + `x64`
2. 后缀包含 `setup.exe` 或 `.exe`

### 4. Version Comparison

GitHub tag 格式为 `v0.2.4`，客户端版本格式为 `0.2.4`。
比较时统一 strip leading `v`。

## Files to Change

| File | Change |
|------|--------|
| `.github/workflows/release.yml` | 新建 |
| `src/renderer/services/endpoints.ts` | 更新检查 URL 指向 GitHub API |
| `src/renderer/services/appUpdate.ts` | 适配 GitHub API 响应格式 |

## Verification

1. **CI 验证**: 打 tag `v0.2.5` push 后，检查 GitHub Actions run 是否成功，Release 是否创建，assets 是否上传
2. **客户端验证**: 客户端启动时检查更新是否能正确获取版本信息（可在 dev 模式用旧版本号测试）

## Notes

- Windows NSIS 安装包（.exe）作为主要更新包
- macOS DMG 和 Linux AppImage/deb 作为可选
- 不再依赖内部 API 服务器
- 测试模式下仍可使用内部 API（通过 `testMode` flag 区分），但默认生产环境走 GitHub
