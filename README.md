<div align="center">

# ![Gearl](public/logo.png#gh-light-mode-only#logo)![Gearl](public/logo.png#gh-dark-mode-only#logo)

 ### [*鉴玄* · English](#)

---

**Gearl** — A desktop AI Agent platform powered by Claude, built with Electron.

Create Agents with distinct personas, skill sets, and conversation histories. Agents code, research, and generate documents — all under your supervision.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-40-47848F?style=flat-square&logo=electron&logoColor=white)](https://electronjs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D%2024-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-brightgreen?style=flat-square)](#)

---

</div>

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Agent System](#agent-system)
- [Skills & MCP](#skills--mcp)
- [Memory](#memory)
- [Artifacts](#artifacts)
- [Architecture](#architecture)
- [Security](#security)
- [Tech Stack](#tech-stack)

## Features

| | |
|---|---|
| **Multi-Agent** | Create Agents with distinct personas, prompts, and capabilities |
| **Cowork Sessions** | Streamed AI responses with real-time tool execution |
| **Skills** | Reusable capability packages (docx, xlsx, pptx, web search, and more) |
| **MCP Servers** | Connect to Model Context Protocol servers for extended tools |
| **Persistent Memory** | Agents remember your preferences across sessions |
| **Artifacts** | Live preview for HTML, SVG, Mermaid, and React components |
| **Permission Gate** | Every sensitive operation requires your explicit approval |
| **Cross-Platform** | macOS, Windows, Linux |

## Quick Start

### Requirements

- Node.js >= 24 < 25
- API key from any Claude-compatible provider

### Install

```bash
git clone https://github.com/menhulu233/gearl.git
cd gearl
npm install
```

### Develop

```bash
npm run electron:dev
```

Dev server runs at `http://localhost:5175` with hot-reload.

### Build & Distribute

```bash
npm run build        # Compile TypeScript + Vite bundle
npm run lint         # ESLint check

npm run dist:mac     # macOS (.dmg)
npm run dist:win     # Windows (.exe)
npm run dist:linux   # Linux (.AppImage)
```

## Agent System

### What is an Agent?

An Agent is a configured AI persona with:

- **Name & description**
- **System prompt** — custom instructions and behavior guidelines
- **Skill set** — which Skills are active
- **Execution mode** — how tools are run
- **Conversation history** — isolated per Agent

### Creating an Agent

1. Click **New Agent** in the sidebar
2. Set a name and system prompt
3. Select active Skills
4. Choose execution mode
5. Start collaborating

### Execution Modes

| Mode | Description |
|------|-------------|
| `auto` | Prefer sandbox, fall back to local |
| `local` | Run tools directly on your machine |
| `sandbox` | Isolated VM environment for all operations |

### Cowork Sessions

When you send a message to an Agent, a Cowork session begins:

1. **Streaming** — AI response streams token-by-token
2. **Tool Calls** — If the Agent requests a tool, a permission modal appears
3. **Approval** — You approve or deny each operation
4. **Complete** — Response finished and stored in conversation history

### Session Management

- Rename, pin, or delete sessions
- Batch operations for multiple sessions
- Export session as image

## Skills & MCP

### Skills

Skills are packaged capabilities Agents can use. Configure them per Agent.

| Skill | Description |
|-------|-------------|
| Web Search | Real-time search via Playwright-controlled browser |
| Docx | Generate Word documents |
| Xlsx | Generate Excel spreadsheets |
| Pptx | Generate PowerPoint presentations |
| PDF | Create and manipulate PDF files |
| Email | IMAP/SMTP email management |
| Calendar | Access system calendar (macOS/Windows) |
| Playwright | Browser automation |
| and more | Community and custom Skills available |

### MCP Servers

Model Context Protocol servers extend what Agents can do. Configure MCP servers in **Settings → MCP**.

Supported transport types:

| Type | Description |
|------|-------------|
| `stdio` | Local command-line servers |
| `SSE` | Server-Sent Events over HTTP |
| `HTTP` | Streamable HTTP |

## Memory

Gearl has a persistent memory system that captures facts about you over time.

### How It Works

- **Auto-extraction** — After each conversation turn, the system identifies personal facts, preferences, and context
- **Explicit** — Tell the Agent "remember that I prefer Markdown" for higher-confidence storage
- **Manual** — Add, edit, or delete memory entries in **Settings → Memory**

### Guard Levels

Control how aggressively memories are captured:

| Level | Description |
|-------|-------------|
| `strict` | Only high-confidence explicit statements |
| `standard` | Balanced (recommended) |
| `relaxed` | Capture more, including implicit signals |

## Artifacts

Artifacts render code outputs as live previews.

| Type | Rendering |
|------|-----------|
| `html` | Full page in sandboxed iframe |
| `svg` | DOMPurify-sanitized with zoom |
| `mermaid` | Diagrams via Mermaid.js |
| `react` | Isolated iframe, no network |
| `code` | Syntax-highlighted with line numbers |

Toggle between code view and artifact preview with the badge in each message.

## Architecture

Gearl uses strict process isolation in Electron. All cross-process communication goes through IPC.

### Process Model

**Main Process** (`src/main/main.ts`)

- Window lifecycle
- SQLite persistence (sql.js)
- CoworkRunner — Claude Agent SDK execution
- IPC handlers for store, Agent, and API operations
- Security: context isolation on, node integration off, sandbox on

**Preload** (`src/main/preload.ts`)

- Exposes `window.electron` via `contextBridge`
- `cowork` namespace for session management and streaming

**Renderer** (`src/renderer/`)

- React 18 + Redux Toolkit + Tailwind CSS
- All UI and business logic
- IPC-only communication with main process

### Directory Structure

```
src/main/
├── main.ts              # Entry point, IPC handlers
├── sqliteStore.ts       # SQLite database (kv + Agent tables)
├── coworkStore.ts       # Session/message CRUD
└── libs/
    ├── coworkRunner.ts         # Claude Agent SDK engine
    ├── coworkVmRunner.ts       # Sandbox VM mode
    ├── coworkMemoryExtractor.ts # Memory extraction
    └── coworkMemoryJudge.ts    # Memory validation

src/renderer/
├── App.tsx              # Root component
├── types/cowork.ts       # Type definitions
├── store/slices/
│   ├── coworkSlice.ts    # Session and streaming state
│   └── artifactSlice.ts  # Artifacts state
├── services/
│   ├── cowork.ts         # IPC wrapper, Redux integration
│   ├── api.ts           # LLM API with SSE streaming
│   └── artifactParser.ts # Artifact detection
└── components/
    ├── cowork/           # Cowork UI components
    └── artifacts/        # Artifact renderers

SKILLs/                   # Skill definitions
skills.config.json         # Skill enable/order config
```

### Data Storage

SQLite database (`gearlai.sqlite`) in user data directory.

| Table | Purpose |
|-------|---------|
| `kv` | App config key-value pairs |
| `cowork_config` | Agent settings (working dir, system prompt, mode) |
| `cowork_sessions` | Session metadata |
| `cowork_messages` | Message history |

## Security

| | |
|---|---|
| **Process Isolation** | Context isolation enabled, node integration disabled |
| **Permission Gate** | Sensitive tool calls require explicit user approval |
| **Sandbox** | Optional isolated VM execution environment |
| **IPC Validation** | All cross-process calls are type-checked |
| **Workspace Boundaries** | File operations scoped to designated directories |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Electron 40 |
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Redux Toolkit |
| AI Engine | Claude Agent SDK (Anthropic) |
| Storage | sql.js (SQLite) |
| Markdown | react-markdown + remark-gfm + rehype-katex |
| Diagrams | Mermaid |
| Security | DOMPurify |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add something'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT
