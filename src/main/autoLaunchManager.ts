import { app } from 'electron';
import { execSync } from 'child_process';

function ensureWindowsAutoLaunchArgs(): void {
  if (process.platform !== 'win32') return;
  try {
    const appName = app.getName();
    const exePath = app.getPath('exe');
    const regPath = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';

    let currentValue: string | undefined;
    try {
      const output = execSync(`reg query "${regPath}" /v "${appName}"`, { encoding: 'utf-8' });
      const lines = output.split('\n').map((l) => l.trim()).filter(Boolean);
      const valueLine = lines.find((l) => l.includes(appName));
      if (valueLine) {
        const regSzIndex = valueLine.indexOf('REG_SZ');
        if (regSzIndex !== -1) {
          currentValue = valueLine.slice(regSzIndex + 'REG_SZ'.length).trim();
        }
      }
    } catch {
      // Key or value doesn't exist
      return;
    }

    const expectedValue = `"${exePath}" --auto-launched`;
    // Fix if not properly quoted or missing args (Electron < 40.8.0 bug on Windows)
    if (!currentValue || !currentValue.startsWith('"') || !currentValue.includes('--auto-launched')) {
      execSync(`reg add "${regPath}" /v "${appName}" /t REG_SZ /d "${expectedValue}" /f`);
      console.log('[AutoLaunch] Fixed Windows registry entry for quoted path and args');
    }
  } catch (error) {
    console.error('[AutoLaunch] Failed to ensure Windows auto-launch args:', error);
  }
}

export function repairWindowsAutoLaunchIfNeeded(): void {
  if (process.platform !== 'win32') return;
  try {
    const settings = app.getLoginItemSettings({
      args: ['--auto-launched'],
    });
    if (settings.openAtLogin) {
      ensureWindowsAutoLaunchArgs();
    }
  } catch (error) {
    console.error('[AutoLaunch] Failed to repair Windows auto-launch:', error);
  }
}

export function getAutoLaunchEnabled(): boolean {
  try {
    // Windows: must pass the same args used in setLoginItemSettings,
    // otherwise openAtLogin defaults to comparing against [] which
    // won't match the registered ['--auto-launched'] and returns false.
    const settings = app.getLoginItemSettings({
      args: ['--auto-launched'],
    });
    return settings.openAtLogin;
  } catch (error) {
    console.error('Failed to get auto-launch settings:', error);
    return false;
  }
}

export function setAutoLaunchEnabled(enabled: boolean): void {
  const isMac = process.platform === 'darwin';

  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      // macOS: 自启后窗口不显示，M芯片和Intel均兼容
      openAsHidden: isMac ? enabled : false,
      // Windows: 通过命令行参数标记自启动
      args: enabled ? ['--auto-launched'] : [],
    });
    // Windows: Electron < 40.8.0 does not quote the exe path in registry,
    // causing args to be lost when the path contains spaces.
    if (enabled && process.platform === 'win32') {
      ensureWindowsAutoLaunchArgs();
    }
  } catch (error) {
    console.error('Failed to set auto-launch settings:', error);
    throw error;
  }
}

export function isAutoLaunched(): boolean {
  try {
    if (process.platform === 'darwin') {
      const settings = app.getLoginItemSettings();
      return settings.wasOpenedAtLogin || false;
    }
    // Windows: 检查命令行参数
    return process.argv.includes('--auto-launched');
  } catch (error) {
    console.error('Failed to check auto-launch status:', error);
    return false;
  }
}
