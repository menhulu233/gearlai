import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { cpRecursiveSync } from '../fsCompat';

const UV_RUNTIME_DIR_NAME = 'uv-runtime';
const UV_WIN32_DIR_NAME = 'win32';
const UV_EXE_NAME = 'uv.exe';
const UVX_EXE_NAME = 'uvx.exe';

function resolveBundledCandidates(): string[] {
  if (app.isPackaged) {
    return [
      path.join(process.resourcesPath, UV_RUNTIME_DIR_NAME, UV_WIN32_DIR_NAME),
      path.join(app.getAppPath(), UV_RUNTIME_DIR_NAME, UV_WIN32_DIR_NAME),
    ];
  }

  const projectRoot = path.resolve(__dirname, '..', '..', '..');
  return [
    path.join(projectRoot, 'resources', UV_RUNTIME_DIR_NAME, UV_WIN32_DIR_NAME),
    path.join(process.cwd(), 'resources', UV_RUNTIME_DIR_NAME, UV_WIN32_DIR_NAME),
    path.join(app.getAppPath(), 'resources', UV_RUNTIME_DIR_NAME, UV_WIN32_DIR_NAME),
  ];
}

export function getBundledUvRoot(): string | null {
  const candidates = resolveBundledCandidates();
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }
  return null;
}

export function getUserUvRoot(): string {
  return path.join(app.getPath('userData'), 'runtimes', UV_RUNTIME_DIR_NAME, UV_WIN32_DIR_NAME);
}

function getBundledPythonRoot(): string | null {
  // Defer import to avoid circular dependency issues at module load time
  // pythonRuntime is imported only when needed inside functions
  try {
    const { getBundledPythonRoot: getPy } = require('./pythonRuntime');
    return getPy();
  } catch {
    return null;
  }
}

function appendWindowsPath(current: string | undefined, entries: string[]): string | undefined {
  const delimiter = ';';
  const seen = new Set<string>();
  const merged: string[] = [];

  const append = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const normalized = trimmed.toLowerCase().replace(/[\\/]+$/, '');
    if (seen.has(normalized)) return;
    seen.add(normalized);
    merged.push(trimmed);
  };

  entries.forEach(append);
  (current || '').split(delimiter).forEach(append);

  return merged.length > 0 ? merged.join(delimiter) : current;
}

export function appendUvRuntimeToEnv(env: Record<string, string | undefined>): Record<string, string | undefined> {
  if (process.platform !== 'win32') {
    return env;
  }

  const userRoot = getUserUvRoot();
  const bundledRoot = getBundledUvRoot();
  const candidates = [userRoot, bundledRoot].filter((value): value is string => Boolean(value));
  const pathEntries: string[] = [];
  for (const root of candidates) {
    if (!fs.existsSync(root)) continue;
    pathEntries.push(root);
  }

  if (pathEntries.length > 0) {
    env.PATH = appendWindowsPath(env.PATH, pathEntries);
    // Set GEARLAI_UV_ROOT to the first available root
    env.GEARLAI_UV_ROOT = pathEntries[0];

    // Also set UV_TOOL_DIR to a path under userData so installed tools don't pollute app resources
    const toolDir = path.join(app.getPath('userData'), 'runtimes', 'uv-tools');
    env.UV_TOOL_DIR = toolDir;
  }

  // Point uvx to the bundled Python so it doesn't try to download one
  const bundledPython = getBundledPythonRoot();
  if (bundledPython) {
    const pythonExe = path.join(bundledPython, 'python.exe');
    if (fs.existsSync(pythonExe)) {
      env.UV_PYTHON = pythonExe;
    }
  }

  return env;
}

function runtimeHealth(rootDir: string): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  const required = [UV_EXE_NAME, UVX_EXE_NAME];
  for (const relPath of required) {
    const fullPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullPath)) {
      missing.push(relPath);
    }
  }
  return { ok: missing.length === 0, missing };
}

export async function ensureUvRuntimeReady(): Promise<{ success: boolean; error?: string }> {
  if (process.platform !== 'win32') {
    return { success: true };
  }

  try {
    const userRoot = getUserUvRoot();

    // Already healthy
    const userHealth = runtimeHealth(userRoot);
    if (userHealth.ok) {
      console.log('[uv-runtime] User runtime already healthy');
      return { success: true };
    }

    // Copy from bundled
    const bundledRoot = getBundledUvRoot();
    if (!bundledRoot) {
      const message = 'Bundled uv runtime not found in application resources.';
      console.error(`[uv-runtime] ${message}`);
      return { success: false, error: message };
    }

    const bundledHealth = runtimeHealth(bundledRoot);
    if (!bundledHealth.ok) {
      const message = `Bundled uv runtime is unhealthy (missing: ${bundledHealth.missing.join(', ')})`;
      console.error(`[uv-runtime] ${message}`);
      return { success: false, error: message };
    }

    console.log(`[uv-runtime] Sync runtime to userData: ${userRoot}`);
    if (fs.existsSync(userRoot)) {
      fs.rmSync(userRoot, { recursive: true, force: true });
    }
    fs.mkdirSync(path.dirname(userRoot), { recursive: true });
    cpRecursiveSync(bundledRoot, userRoot, { force: true, dereference: true });

    const syncedHealth = runtimeHealth(userRoot);
    if (!syncedHealth.ok) {
      const message = `Synced uv runtime is unhealthy (missing: ${syncedHealth.missing.join(', ')})`;
      console.error(`[uv-runtime] ${message}`);
      return { success: false, error: message };
    }

    console.log('[uv-runtime] Runtime sync complete');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[uv-runtime] Failed to ensure runtime ready:', message);
    return { success: false, error: message };
  }
}
