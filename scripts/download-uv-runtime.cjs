#!/usr/bin/env node
/**
 * Download and extract uv runtime into resources/uv-runtime/win32.
 *
 * Idempotent: skips if target uv.exe exists and version matches.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const extractZip = require('extract-zip');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'resources', 'uv-runtime', 'win32');

const UV_VERSION = '0.11.6';
const UV_ZIP_NAME = `uv-x86_64-pc-windows-msvc.zip`;
const UV_URL = `https://github.com/astral-sh/uv/releases/download/${UV_VERSION}/${UV_ZIP_NAME}`;
const UV_EXE_NAME = 'uv.exe';
const UVX_EXE_NAME = 'uvx.exe';
const VERSION_FILE = 'version.json';

function isNonEmptyFile(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}

async function downloadArchive(url, destination) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed (${response.status} ${response.statusText}) for ${url}`);
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const tmpFile = `${destination}.download`;
  try {
    const stream = fs.createWriteStream(tmpFile);
    await pipeline(Readable.fromWeb(response.body), stream);

    if (!isNonEmptyFile(tmpFile)) {
      throw new Error('Downloaded archive is empty.');
    }
    fs.renameSync(tmpFile, destination);
  } catch (error) {
    try {
      fs.rmSync(tmpFile, { force: true });
    } catch {
      // ignore cleanup error.
    }
    throw error;
  }
}

async function main() {
  if (process.platform !== 'win32') {
    console.log('[download-uv-runtime] Skip on non-Windows platform.');
    return;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const versionFilePath = path.join(OUTPUT_DIR, VERSION_FILE);
  const uvExePath = path.join(OUTPUT_DIR, UV_EXE_NAME);

  // Idempotency check: if version matches and uv.exe exists, skip
  try {
    if (isNonEmptyFile(versionFilePath)) {
      const content = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
      if (content.version === UV_VERSION && isNonEmptyFile(uvExePath)) {
        console.log(`[download-uv-runtime] uv ${UV_VERSION} already present, skipping.`);
        return;
      }
    }
  } catch {
    // proceed to download if version file is missing or invalid
  }

  const zipPath = path.join(PROJECT_ROOT, 'resources', `uv-${UV_VERSION}-x86_64-pc-windows-msvc.zip`);

  if (!isNonEmptyFile(zipPath)) {
    console.log(`[download-uv-runtime] Downloading uv ${UV_VERSION} from ${UV_URL}...`);
    await downloadArchive(UV_URL, zipPath);
    const sizeKB = (fs.statSync(zipPath).size / 1024).toFixed(0);
    console.log(`[download-uv-runtime] Downloaded (${sizeKB} KB): ${zipPath}`);
  } else {
    console.log(`[download-uv-runtime] Using cached archive: ${zipPath}`);
  }

  // Extract only uv.exe from the zip
  console.log(`[download-uv-runtime] Extracting uv.exe to ${OUTPUT_DIR}...`);
  await extractZip(zipPath, {
    dir: OUTPUT_DIR,
    filter: (entry) => entry.fileName === UV_EXE_NAME,
  });

  if (!isNonEmptyFile(uvExePath)) {
    throw new Error(`uv.exe not found at ${uvExePath} after extraction`);
  }

  // Create uvx.exe as a copy of uv.exe
  const uvxExePath = path.join(OUTPUT_DIR, UVX_EXE_NAME);
  fs.copyFileSync(uvExePath, uvxExePath);
  console.log(`[download-uv-runtime] Created ${UVX_EXE_NAME} as copy of ${UV_EXE_NAME}`);

  // Write version file
  fs.writeFileSync(versionFilePath, JSON.stringify({ version: UV_VERSION, extractedAt: Date.now() }, null, 2));

  console.log(`[download-uv-runtime] uv runtime ${UV_VERSION} ready at ${OUTPUT_DIR}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[download-uv-runtime] ERROR:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

module.exports = { main };
