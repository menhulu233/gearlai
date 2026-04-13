<div align="center">

# 鉴玄

**Gearl** — 基于 Claude 的桌面 AI Agent 平台，由 Electron 驱动。

*[中文](#)*

</div>

---

## 核心特性

**多 Agent** — 创建具有不同人设、提示词和能力的 Agent。

**Cowork 会话** — AI 响应流式输出，实时执行工具，每次操作需你审批。

**技能与 MCP** — 通过 Skills 包和 MCP 服务器扩展能力。

**持久记忆** — Agent 跨会话记住你的偏好。

**Artifacts 预览** — HTML、SVG、Mermaid、React 组件实时预览。

**跨平台** — macOS、Windows、Linux。

---

## 快速开始

```bash
git clone https://github.com/menhulu233/gearl.git
cd gearl
npm install
npm run electron:dev
```

**环境要求：** Node.js >= 24 < 25

---

## Agent 系统

每个 Agent 拥有独立的人设、技能集和会话历史。

**执行模式：**

| 模式 | 说明 |
|------|------|
| `auto` | 优先沙箱，不可用时回退本地 |
| `local` | 本地直接执行 |
| `sandbox` | 隔离 VM 环境执行 |

**协作流程：** 发送消息 → AI 流式响应 → 工具调用弹出权限审批 → 你批准/拒绝 → 响应存入历史。

---

## 技能与 MCP

| 技能 | 说明 |
|------|------|
| 网页搜索 | Playwright 控制的浏览器实时搜索 |
| Word / Excel / PPT | 生成 Office 文档 |
| PDF | 创建和处理 PDF 文件 |
| 邮箱 | IMAP/SMTP 邮件管理 |
| 日历 | 访问系统日历 |

连接 MCP 服务器扩展工具能力，在 **设置 → MCP** 中配置。

---

## 记忆

持久化记忆系统从对话中提取关于你的事实：

- **自动提取** — 每轮对话结束后识别记录
- **主动告知** — 直接说「记住我偏好…」以更高置信度存储
- **手动管理** — 在 **设置 → 记忆** 中管理条目

写入门槛：`strict` / `standard` / `relaxed`。

---

## 架构

Electron 严格进程隔离，所有通信通过 IPC 完成。

**主进程** — 窗口生命周期、SQLite 持久化、Claude Agent SDK 执行。

**渲染进程** — React 18、Redux Toolkit、 Tailwind CSS。仅负责 UI 和业务逻辑。

**数据** — SQLite（`gearlai.sqlite`），位于用户数据目录。

---

## 技术栈

Electron · React 18 · TypeScript · Vite · Tailwind CSS · Redux Toolkit · Claude Agent SDK

---

## 许可证

MIT
