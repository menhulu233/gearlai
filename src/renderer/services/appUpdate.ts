import { getUpdateCheckUrl, getFallbackDownloadUrl } from './endpoints';

export const UPDATE_POLL_INTERVAL_MS = 12 * 60 * 60 * 1000;
export const UPDATE_HEARTBEAT_INTERVAL_MS = 30 * 60 * 1000;

type GithubReleaseResponse = {
  tag_name: string;        // "v0.2.4"
  name: string;            // "GearlAI v0.2.4"
  body: string;            // markdown changelog
  published_at: string;    // "2026-04-16T..."
  assets: Array<{
    name: string;          // "GearlAI Setup 0.2.4.exe"
    browser_download_url: string;
  }>;
};

export type ChangeLogEntry = { title: string; content: string[] };

export interface AppUpdateDownloadProgress {
  received: number;
  total: number | undefined;
  percent: number | undefined;
  speed: number | undefined;
}

export interface AppUpdateInfo {
  latestVersion: string;
  date: string;
  changeLog: { zh: ChangeLogEntry; en: ChangeLogEntry };
  url: string;
}

const toVersionParts = (version: string): number[] => (
  version
    .split('.')
    .map((part) => {
      const match = part.trim().match(/^\d+/);
      return match ? Number.parseInt(match[0], 10) : 0;
    })
);

const compareVersions = (a: string, b: string): number => {
  const aParts = toVersionParts(a);
  const bParts = toVersionParts(b);
  const maxLength = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < maxLength; i += 1) {
    const left = aParts[i] ?? 0;
    const right = bParts[i] ?? 0;
    if (left > right) return 1;
    if (left < right) return -1;
  }

  return 0;
};

const isNewerVersion = (latestVersion: string, currentVersion: string): boolean => (
  compareVersions(latestVersion, currentVersion) > 0
);

const getPlatformDownloadUrl = (release: GithubReleaseResponse): string => {
  const { platform } = window.electron;

  for (const asset of release.assets ?? []) {
    const name = asset.name.toLowerCase();

    if (platform === 'darwin' && name.includes('.dmg')) {
      return asset.browser_download_url;
    }

    if (platform === 'win32' && name.includes('setup') && name.endsWith('.exe')) {
      // Note: electron-builder NSIS output is always x64, no arch suffix in filename
      return asset.browser_download_url;
    }

    if (platform === 'linux') {
      if (name.includes('amd64') && name.endsWith('.appimage')) {
        return asset.browser_download_url;
      }
      if (name.includes('amd64') && name.endsWith('.deb')) {
        return asset.browser_download_url;
      }
    }
  }

  return getFallbackDownloadUrl();
};

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

  // Parse body (markdown) into changelog entries
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
