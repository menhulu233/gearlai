# lobster-cowork-pure

<p align="center">
  <img src="public/logo.png" alt="LobsterAI" width="120">
</p>

<p align="center">
  <strong>基于 LobsterAI 的桌面级 AI 协作应用，仅保留 Cowork 核心功能</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
  <br>
  <img src="https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-brightgreen?style=for-the-badge" alt="Platform">
  <br>
  <img src="https://img.shields.io/badge/Electron-40-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
</p>

<p align="center">
  <a href="README_zh.md">English</a> · 中文
</p>

---

**lobster-cowork-pure** 是 [LobsterAI](https://github.com/netease-youdao/LobsterAI) 的桌面端分支，专注于维护其核心功能 —— **Cowork 模式**。

Cowork 模式基于 Claude Agent SDK，能够在本地或沙箱环境中执行工具、操作文件、运行命令，所有敏感操作均需用户审批，全程在你的监督下完成。

## 核心特性

- **Cowork 会话** — 基于 Claude Agent SDK 的 AI 协作会话，支持流式响应和实时交互
- **本地 + 沙箱执行** — 支持本地直接运行或隔离的沙箱环境
- **权限门控** — 所有敏感工具调用需用户明确批准后执行
- **持久记忆** — 自动从对话中提取用户偏好与个人信息，跨会话记住你的习惯
- **Artifact 预览** — 支持 HTML、SVG、Mermaid、React 组件等代码输出的实时预览
- **跨平台** — macOS（Intel + Apple Silicon）、Windows、Linux 桌面端
- **数据本地化** — SQLite 本地存储，聊天记录和配置不离开你的设备

## 快速开始

### 环境要求

- **Node.js** >= 24 < 25
- **npm**

### 安装与开发

```bash
# 克隆仓库
git clone https://github.com/your-repo/lobster-cowork-pure.git
cd lobster-cowork-pure

# 安装依赖
npm install

# 启动开发环境（Vite 开发服务器 + Electron 热重载）
npm run electron:dev
```

开发服务器默认运行在 `http://localhost:5175`。

### 生产构建

```bash
# 编译 TypeScript + Vite 打包
npm run build

# ESLint 代码检查
npm run lint
```

### 打包分发

```bash
# macOS (.dmg)
npm run dist:mac

# Windows (.exe)
npm run dist:win

# Linux (.AppImage)
npm run dist:linux
```

## 架构概览

lobster-cowork-pure 采用 Electron 严格进程隔离架构，所有跨进程通信通过 IPC 完成。

### 进程模型

**Main Process**（`src/main/main.ts`）：
- 窗口生命周期管理
- SQLite 数据持久化
- CoworkRunner — Claude Agent SDK 执行引擎
- IPC handlers 处理 store、cowork 和 API 操作
- 安全：context isolation 启用，node integration 禁用，sandbox 启用

**Preload Script**（`src/main/preload.ts`）：
- 通过 `contextBridge` 暴露 `window.electron` API
- 包含 `cowork` 命名空间用于会话管理和流式事件

**Renderer Process**（`src/renderer/`）：
- React 18 + Redux Toolkit + Tailwind CSS
- 所有 UI 和业务逻辑
- 仅通过 IPC 与主进程通信

### 目录结构

```
src/main/
├── main.ts              # 入口点，IPC handlers
├── sqliteStore.ts       # SQLite 数据库（kv + cowork 表）
├── coworkStore.ts       # Cowork 会话/消息 CRUD
└── libs/
    ├── coworkRunner.ts         # Claude Agent SDK 执行引擎
    ├── coworkVmRunner.ts       # 沙箱 VM 执行模式
    ├── claudeSdk.ts           # SDK 加载工具
    └── coworkMemoryExtractor.ts # 记忆提取

src/renderer/
├── App.tsx              # 根组件
├── types/cowork.ts      # Cowork 类型定义
├── store/slices/
│   ├── coworkSlice.ts   # Cowork 会话和流式状态
│   └── artifactSlice.ts # Artifacts 状态
├── services/
│   ├── cowork.ts        # Cowork 服务（IPC 封装）
│   ├── api.ts           # LLM API 与 SSE 流式
│   └── artifactParser.ts # Artifact 检测与解析
└── components/
    ├── cowork/          # Cowork UI 组件
    │   ├── CoworkView.tsx          # 主界面
    │   ├── CoworkSessionList.tsx   # 会话侧边栏
    │   ├── CoworkSessionDetail.tsx # 消息展示
    │   └── CoworkPermissionModal.tsx # 权限审批弹窗
    └── artifacts/       # Artifact 渲染器

SKILLs/                  # 技能定义（用于 cowork 会话中的扩展能力）
├── skills.config.json   # 技能启用/排序配置
├── docx/               # Word 文档生成
├── xlsx/               # Excel 表格
├── pptx/               # PowerPoint 演示
└── ...
```

## Cowork 系统

### 执行模式

| 模式 | 说明 |
|------|------|
| `auto` | 自动根据上下文选择执行方式 |
| `local` | 本地直接执行，全速运行 |
| `sandbox` | 隔离的沙箱环境，安全优先 |

### 流式事件

Cowork 通过 IPC 事件实现实时双向通信：

- `message` — 新消息加入会话
- `messageUpdate` — 流式内容增量更新
- `permissionRequest` — 工具执行需要用户审批
- `complete` — 会话执行完毕
- `error` — 执行出错

### 权限控制

所有涉及文件系统、终端命令、网络请求的工具调用都需要用户在 `CoworkPermissionModal` 中明确批准。支持单次批准和会话级批准。

## 持久记忆

Cowork 内置记忆系统，能够跨会话记住你的个人信息和偏好。

### 记忆获取方式

- **自动提取** — 对话过程中，系统自动识别并记录个人信息、偏好习惯和个人事实
- **主动告知** — 在对话中直接说「记住我喜欢用 Markdown 格式」等，Agent 会以更高置信度存储
- **手动管理** — 在设置面板的记忆管理界面中手动添加、编辑或删除记忆条目

### 工作机制

每轮对话结束后，记忆提取器会分析对话内容：

| 提取类型 | 示例 | 置信度 |
|---------|------|--------|
| 个人档案 | 「我叫张三」「我是产品经理」 | 高 |
| 个人所有 | 「我养了一只猫」「我有一台 MacBook」 | 高 |
| 个人偏好 | 「我喜欢简洁的风格」「我偏好英文回复」 | 中高 |
| 主动告知 | 「记住这个」「请记下来」 | 最高 |

## Artifacts 系统

Artifacts 提供代码输出的富文本预览：

| 类型 | 说明 |
|------|------|
| `html` | 完整 HTML 页面，在沙箱 iframe 中渲染 |
| `svg` | SVG 图形，带缩放控制 |
| `mermaid` | 流程图、时序图、类图等 |
| `react` | React/JSX 组件，独立 iframe 隔离渲染 |
| `code` | 语法高亮代码，带行号 |

## 数据存储

所有数据存储在本地 SQLite 数据库（`lobsterai.sqlite`，位于用户数据目录）。

| 表 | 用途 |
|----|------|
| `kv` | 应用配置键值对 |
| `cowork_config` | Cowork 设置（工作目录、系统提示词、执行模式） |
| `cowork_sessions` | 会话元数据 |
| `cowork_messages` | 消息历史 |

## 安全模型

- **进程隔离** — context isolation 启用，node integration 禁用
- **权限门控** — 敏感工具调用需用户明确审批
- **沙箱执行** — 可选沙箱隔离执行环境
- **工作区边界** — 文件操作限制在指定工作目录内
- **IPC 验证** — 所有跨进程调用经过类型检查

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Electron 40 |
| 前端 | React 18 + TypeScript |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS 3 |
| 状态 | Redux Toolkit |
| AI 引擎 | Claude Agent SDK (Anthropic) |
| 存储 | sql.js |
| Markdown | react-markdown + remark-gfm + rehype-katex |
| 图表 | Mermaid |
| 安全 | DOMPurify |

## 开发规范

- TypeScript 严格模式，函数式组件 + Hooks
- 2 空格缩进，单引号，分号
- 组件 `PascalCase`，函数/变量 `camelCase`，Redux 切片 `*Slice.ts`
- Tailwind CSS 优先，避免自定义 CSS
- 提交信息遵循 `type: short imperative summary` 格式

## 贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/your-feature`)
3. 提交改动 (`git commit -m 'feat: add something'`)
4. 推送到远程 (`git push origin feature/your-feature`)
5. 发起 Pull Request

## 许可证

[MIT License](LICENSE)
