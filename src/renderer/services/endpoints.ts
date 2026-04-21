/**
 * 集中管理所有业务 API 端点。
 * 后续新增的业务接口也应在此文件中配置。
 */

import { configService } from './config';

const isTestMode = () => {
  return configService.getConfig().app?.testMode === true;
};

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

// Skill 商店
export const getSkillStoreUrl = () => isTestMode()
  ? 'https://api-overmind.youdao.com/openapi/get/luna/hardware/gearlai/test/skill-store'
  : 'https://api-overmind.youdao.com/openapi/get/luna/hardware/gearlai/prod/skill-store';
