# 鉴玄

**Gearl** — 基于 Claude 的桌面 AI Agent 平台，由 Electron 驱动。

在鉴玄中，你可以创建、配置多种 AI Agent 角色。每个 Agent 拥有独立的人设、技能和会话历史。Agent 能帮你写代码、查资料、写文档——一切都在你的掌控下进行。

## 目录

- [核心特性](#核心特性)
- [快速开始](#快速开始)
- [Agent 系统](#agent-系统)
- [技能与 MCP](#技能与-mcp)
- [记忆](#记忆)
- [Artifacts 预览](#artifacts-预览)
- [架构](#架构)
- [安全模型](#安全模型)
- [技术栈](#技术栈)

## 核心特性

- **多 Agent** — 创建具有不同人设、提示词和能力的 Agent
- **Cowork 会话** — AI 响应流式输出，实时执行工具
- **技能（Skills）** — 可复用能力包（Word、Excel、PPT、网页搜索等）
- **MCP 服务器** — 通过 Model Context Protocol 服务器扩展工具能力
- **持久记忆** — Agent 跨会话记住你的偏好
- **Artifacts** — HTML、SVG、Mermaid、React 组件实时预览
- **权限门控** — 所有敏感操作需经你明确审批
- **跨平台** — macOS、Windows、Linux

## 快速开始

### 环境要求

- Node.js >= 24 < 25
- API Key（支持任意 Claude 兼容 provider）

### 安装

```bash
git clone https://github.com/menhulu233/gearl.git
cd gearl
npm install
```

### 开发

```bash
npm run electron:dev
```

开发服务器运行在 `http://localhost:5175`，支持热重载。

### 生产构建

```bash
npm run build        # 编译 TypeScript + Vite 打包
npm run lint         # ESLint 检查
```

### 打包分发

```bash
npm run dist:mac     # macOS (.dmg)
npm run dist:win     # Windows (.exe)
npm run dist:linux   # Linux (.AppImage)
```

## Agent 系统

### 什么是 Agent

Agent 是配置好的 AI 人设，包含：
- **名称和描述**
- **系统提示词** — 自定义指令和行为规范
- **技能集** — 启用哪些 Skill
- **执行模式** — 工具如何运行
- **会话历史** — 每个 Agent 独立存储

### 创建 Agent

1. 在侧边栏点击 **新建 Agent**
2. 设置名称和系统提示词
3. 选择启用的技能
4. 选择执行模式
5. 开始协作

### 执行模式

| 模式 | 说明 |
|------|------|
| `auto` | 优先沙箱，不可用时回退本地 |
| `local` | 本地直接执行，全速运行 |
| `sandbox` | 隔离的 VM 环境执行所有操作 |

### Cowork 会话

当你向 Agent 发送消息时，Cowork 会话启动：

1. **流式输出** — AI 响应逐 token 流式返回
2. **工具调用** — Agent 如需执行工具，弹出权限审批弹窗
3. **审批** — 你批准或拒绝每次操作
4. **完成** — 响应结束并存储到会话历史

### 会话管理

- 重命名、置顶、删除会话
- 批量操作多个会话
- 将会话导出为图片

## 技能与 MCP

### 技能（Skills）

技能是 Agent 可使用的封装能力包，可按 Agent 配置启用。

| 技能 | 说明 |
|------|------|
| 网页搜索 | 通过 Playwright 控制的浏览器实时搜索 |
| Word 文档 | 生成 .docx 文件 |
| Excel 表格 | 生成 .xlsx 文件 |
| PPT 演示 | 生成 .pptx 文件 |
| PDF | 创建和处理 PDF 文件 |
| 邮箱 | IMAP/SMTP 邮件管理 |
| 日历 | 访问系统日历（macOS/Windows） |
| Playwright | 浏览器自动化 |
| 更多 | 社区和自定义技能持续更新中 |

### MCP 服务器

MCP（Model Context Protocol）服务器扩展 Agent 的能力。在 **设置 → MCP** 中配置。

支持的传输类型：
- **stdio** — 本地命令行服务器
- **SSE** — HTTP 上的 Server-Sent Events
- **HTTP** — 流式 HTTP

## 记忆

鉴玄内置持久化记忆系统，从对话中提取关于你的事实。

### 工作原理

- **自动提取** — 每次对话轮次结束后，系统识别并记录个人信息、偏好和上下文
- **主动告知** — 直接告诉 Agent「记住我偏好 Markdown」，以更高置信度存储
- **手动管理** — 在 **设置 → 记忆** 中手动添加、编辑或删除记忆条目

### 写入门槛

| 级别 | 说明 |
|------|------|
| `strict` | 仅高置信度的显式声明 |
| `standard` | 均衡模式（推荐） |
| `relaxed` | 捕获更多，包括隐式信号 |

## Artifacts 预览

Artifacts 将代码输出渲染为可交互的预览。

| 类型 | 渲染方式 |
|------|---------|
| `html` | 沙箱 iframe 中全页渲染 |
| `svg` | 经 DOMPurify 清理，带缩放控制 |
| `mermaid` | Mermaid.js 渲染图表 |
| `react` | 独立 iframe 隔离渲染，无网络访问 |
| `code` | 语法高亮代码，带行号 |

每条消息中的 badge 可在代码视图和 Artifact 预览间切换。

## 架构

鉴玄采用 Electron 严格进程隔离架构，所有跨进程通信通过 IPC 完成。

### 进程模型

**主进程**（`src/main/main.ts`）
- 窗口生命周期管理
- SQLite 持久化（sql.js）
- CoworkRunner — Claude Agent SDK 执行引擎
- IPC handlers 处理 store、Agent 和 API 操作
- 安全：context isolation 启用，node integration 禁用，sandbox 启用

**预加载脚本**（`src/main/preload.ts`）
- 通过 `contextBridge` 暴露 `window.electron` API
- `cowork` 命名空间用于会话管理和流式事件

**渲染进程**（`src/renderer/`）
- React 18 + Redux Toolkit + Tailwind CSS
- 所有 UI 和业务逻辑
- 仅通过 IPC 与主进程通信

### 目录结构

```
src/main/
├── main.ts              # 入口点，IPC handlers
├── sqliteStore.ts       # SQLite 数据库（kv + Agent 表）
├── coworkStore.ts       # 会话/消息 CRUD
└── libs/
    ├── coworkRunner.ts         # Claude Agent SDK 执行引擎
    ├── coworkVmRunner.ts       # 沙箱 VM 模式
    ├── coworkMemoryExtractor.ts # 记忆提取
    └── coworkMemoryJudge.ts    # 记忆验证

src/renderer/
├── App.tsx              # 根组件
├── types/cowork.ts      # 类型定义
├── store/slices/
│   ├── coworkSlice.ts   # 会话和流式状态
│   └── artifactSlice.ts # Artifacts 状态
├── services/
│   ├── cowork.ts        # IPC 封装，Redux 集成
│   ├── api.ts           # LLM API 与 SSE 流式
│   └── artifactParser.ts # Artifact 检测与解析
└── components/
    ├── cowork/          # Cowork UI 组件
    └── artifacts/       # Artifact 渲染器

SKILLs/                  # 技能定义
skills.config.json        # 技能启用/排序配置
```

### 数据存储

SQLite 数据库（`gearlai.sqlite`），位于用户数据目录。

| 表 | 用途 |
|----|------|
| `kv` | 应用配置键值对 |
| `cowork_config` | Agent 设置（工作目录、系统提示词、执行模式） |
| `cowork_sessions` | 会话元数据 |
| `cowork_messages` | 消息历史 |

## 安全模型

- **进程隔离** — context isolation 启用，node integration 禁用
- **权限门控** — 敏感工具调用需用户明确审批
- **沙箱执行** — 可选隔离 VM 执行环境
- **工作区边界** — 文件操作限制在指定目录内
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
| 存储 | sql.js（SQLite） |
| Markdown | react-markdown + remark-gfm + rehype-katex |
| 图表 | Mermaid |
| 安全 | DOMPurify |

## 贡献

1. Fork 本仓库
2. 创建特性分支（`git checkout -b feature/your-feature`）
3. 提交改动（`git commit -m 'feat: add something'`）
4. 推送到远程（`git push origin feature/your-feature`）
5. 发起 Pull Request

## 许可证

MIT
