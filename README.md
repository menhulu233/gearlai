<div align="center">

# Gearl

**鉴玄** — A desktop AI Agent platform powered by Claude, built with Electron.

*[English](#) · [中文](./README_zh.md)*

</div>

---

## Features

**Multi-Agent** — Create Agents with distinct personas, prompts, and capabilities.

**Cowork Sessions** — Streamed AI responses with real-time tool execution. Every operation requires your approval.

**Skills & MCP** — Extend capabilities with Skills packages and Model Context Protocol servers.

**Persistent Memory** — Agents remember your preferences across sessions.

**Artifacts** — Live preview for HTML, SVG, Mermaid, and React components.

**Cross-Platform** — macOS, Windows, Linux.

---

## Quick Start

```bash
git clone https://github.com/menhulu233/gearl.git
cd gearl
npm install
npm run electron:dev
```

**Requirements:** Node.js >= 24 < 25

---

## Agent System

Each Agent has its own persona, skill set, and conversation history.

**Execution Modes:**

| Mode | Description |
|------|-------------|
| `auto` | Prefer sandbox, fall back to local |
| `local` | Run tools directly on your machine |
| `sandbox` | Isolated VM environment |

**Cowork Flow:** Send a message → AI responds streaming → Permission modal for tool calls → You approve/deny → Response stored.

---

## Skills & MCP

| Skill | Description |
|-------|-------------|
| Web Search | Real-time search via Playwright |
| Docx / Xlsx / Pptx | Generate Office documents |
| PDF | Create and manipulate PDFs |
| Email | IMAP/SMTP email management |
| Calendar | Access system calendar |

Connect MCP servers for extended tools. Configure in **Settings → MCP**.

---

## Memory

Persistent memory captures facts about you over time:

- **Auto-extraction** — Identified after each conversation turn
- **Explicit** — Say "remember that I prefer..." for higher confidence
- **Manual** — Manage entries in **Settings → Memory**

Guard levels: `strict` / `standard` / `relaxed`.

---

## Architecture

Electron with strict process isolation. All IPC communication.

**Main Process** — Window lifecycle, SQLite persistence, Claude Agent SDK execution.

**Renderer** — React 18, Redux Toolkit, Tailwind CSS. UI and business logic only.

**Data** — SQLite (`gearlai.sqlite`) in user data directory.

---

## Tech Stack

Electron · React 18 · TypeScript · Vite · Tailwind CSS · Redux Toolkit · Claude Agent SDK

---

## License

MIT
