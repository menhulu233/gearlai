# GitHub Auto-Release & Auto-Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 GitHub 自动发版（打 tag → CI 构建 → GitHub Release）和客户端从 GitHub Releases API 获取更新

**Architecture:**
- CI/CD: GitHub Actions workflow，push `v*.*.*` tag 时触发，构建三平台安装包并上传到 GitHub Release
- 客户端: `endpoints.ts` 指向 GitHub Releases API，`appUpdate.ts` 解析 GitHub API 响应格式，复用现有下载/安装逻辑

**Tech Stack:** GitHub Actions, electron-builder, TypeScript

---

## 文件改动概览

| File | Action |
|------|--------|
| `.github/workflows/release.yml` | 新建 |
| `src/renderer/services/endpoints.ts` | 修改 |
| `src/renderer/services/appUpdate.ts` | 修改 |

---

## Task 1: 创建 GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: 创建 workflow 文件**

三个平台分别构建，最后由 ubuntu job 汇总上传（节省 quota）：

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: windows-latest
            build_cmd: npm run dist:win
            artifact: release/GearlAI Setup*.exe
          - os: macos-latest
            build_cmd: npm run dist:mac:universal
            artifact: release/GearlAI-*.dmg
          - os: ubuntu-latest
            build_cmd: npm run dist:linux
            artifact: release/

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '24'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: ${{ matrix.build_cmd }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.os }}
          path: ${{ matrix.artifact }}

  release:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: artifacts

      - name: List artifacts
        run: |
          echo "=== Windows ===" && ls artifacts/windows-latest/ 2>/dev/null || true
          echo "=== macOS ===" && ls artifacts/macos-latest/ 2>/dev/null || true
          echo "=== Linux ===" && ls artifacts/ubuntu-latest/ 2>/dev/null || true

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ github.ref_name }}
          name: GearlAI ${{ github.ref_name }}
          draft: false
          prerelease: false
          generate_release_notes: true
          files: |
            artifacts/windows-latest/*
            artifacts/macos-latest/*
            artifacts/ubuntu-latest/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

> **Note:** Windows/macOS 构建分别在不同 runner，artifact 通过 `actions/upload-artifact` 传到 ubuntu job 汇总上传。

- [ ] **Step 2: 提交**

```bash
mkdir -p .github/workflows
git add .github/workflows/release.yml
git commit -m "ci: add GitHub Actions release workflow on tag push"
```

---

## Task 2: 修改 endpoints.ts 更新检查 URL

**Files:**
- Modify: `src/renderer/services/endpoints.ts`

- [ ] **Step 1: 修改 getUpdateCheckUrl 和 getFallbackDownloadUrl**

保留 testMode 分支走内部 API，仅生产环境走 GitHub：

```typescript
// GitHub (从 git remote 确认: https://github.com/menhulu233/gearlai)
const GITHUB_OWNER = 'menhulu233';
const GITHUB_REPO = 'gearlai';

// 自动更新
export const getUpdateCheckUrl = () => isTestMode()
  ? 'http://localhost:18000/openapi/get/luna/hardware/gearlai/test/update'
  : `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

export const getFallbackDownloadUrl = () => isTestMode()
  ? 'http://localhost:18000/#/download-list'
  : `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
```

- [ ] **Step 2: 提交**

```bash
git add src/renderer/services/endpoints.ts
git commit -m "refactor: point production update check to GitHub Releases API"
```

---

## Task 3: 修改 appUpdate.ts 适配 GitHub API 响应格式

**Files:**
- Modify: `src/renderer/services/appUpdate.ts`

- [ ] **Step 1: 定义 GitHub API 响应类型**

在文件顶部添加：

```typescript
type GithubReleaseResponse = {
  tag_name: string;        // "v0.2.4"
  name: string;            // "GearlAI v0.2.4"
  body: string;            // markdown changelog
  published_at: string;    // "2026-04-16T..."
  assets: Array<{
    name: string;          // "GearlAI-0.2.4-x64-setup.exe"
    browser_download_url: string;
  }>;
};
```

- [ ] **Step 2: 适配 checkForAppUpdate 解析 GitHub API**

修改 `checkForAppUpdate` 函数，将旧的 `UpdateApiResponse` 解析替换为 GitHub API 解析：

```typescript
export const checkForAppUpdate = async (currentVersion: string): Promise<AppUpdateInfo | null> => {
  const response = await window.electron.api.fetch({
    url: getUpdateCheckUrl(),
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok || typeof response.data !== 'object' || response.data === null) {
    return null;
  }

  const payload = response.data as GithubReleaseResponse;
  const latestVersion = payload.tag_name?.trim().replace(/^v/, '');
  if (!latestVersion || !isNewerVersion(latestVersion, currentVersion)) {
    return null;
  }

  // 解析 body (markdown) 为 changelog 条目
  const content = payload.body
    ? payload.body.split('\n').filter((line) => line.trim().startsWith('-'))
    : [];

  return {
    latestVersion,
    date: payload.published_at ? new Date(payload.published_at).toLocaleDateString() : '',
    changeLog: {
      zh: { title: '', content },
      en: { title: '', content },
    },
    url: getPlatformDownloadUrl(payload),
  };
};
```

- [ ] **Step 3: 重写 getPlatformDownloadUrl 以匹配 GitHub assets**

替换原有的 `getPlatformDownloadUrl`：

```typescript
const getPlatformDownloadUrl = (release: GithubReleaseResponse): string => {
  const { platform, arch } = window.electron;

  for (const asset of release.assets ?? []) {
    const name = asset.name.toLowerCase();

    if (platform === 'darwin' && (name.includes('.dmg'))) {
      return asset.browser_download_url;
    }

    if (platform === 'win32' && name.includes('x64') && (name.includes('setup.exe') || name.endsWith('.exe'))) {
      return asset.browser_download_url;
    }

    if (platform === 'linux') {
      if (name.includes('amd64') && name.endsWith('.AppImage')) {
        return asset.browser_download_url;
      }
      if (name.includes('amd64') && name.endsWith('.deb')) {
        return asset.browser_download_url;
      }
    }
  }

  return getFallbackDownloadUrl();
};
```

- [ ] **Step 4: 清理旧类型**

删除不再使用的 `UpdateApiResponse`、`PlatformDownload`、`ChangeLogLang` 等类型。

- [ ] **Step 5: 提交**

```bash
git add src/renderer/services/appUpdate.ts
git commit -m "refactor: adapt app update to GitHub Releases API"
```

---

## 验证步骤

### CI 验证

```bash
# 1. 确保工作区干净
git status

# 2. 更新版本号（dry run，不会真正发版）
npm version patch  # 自动更新 package.json + 创建 tag v0.2.5

# 3. 本地预览 CI 构建（不推送到远程）
#   检查 .github/workflows/release.yml 语法是否正确
#   确认 electron-builder 在各平台输出正确的 asset 命名

# 4. 推送到远程触发 CI（确认后再操作）
git push && git push --tags
```

### 客户端验证

```bash
# 1. 启动 dev 模式
npm run electron:dev

# 2. 手动触发更新检查（devTools → console）
window.electron.cowork.checkForAppUpdate?.('0.0.0')
#   预期：能正确解析 GitHub API 返回的版本信息
```

---

## 注意事项

- GitHub Actions `GITHUB_TOKEN` 默认可用，无需手动创建 secret
- Windows 构建使用 `softprops/action-gh-release@v2`，asset glob 需与 electron-builder 实际输出命名匹配
- tag 推送前确保 `package.json` 版本号已更新
- 首次发版前建议在 GitHub Actions 页面测试一次，确认三个平台都能成功构建
