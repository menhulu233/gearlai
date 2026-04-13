/**
 * 集中管理所有业务 API 端点。
 * 后续新增的业务接口也应在此文件中配置。
 */

import { configService } from './config';

const isTestMode = () => {
  return configService.getConfig().app?.testMode === true;
};

// 自动更新
export const getUpdateCheckUrl = () => isTestMode()
  ? 'http://localhost:18000/openapi/get/luna/hardware/gearlai/test/update'
  : 'http://localhost:18000/openapi/get/luna/hardware/gearlai/prod/update';

export const getFallbackDownloadUrl = () => isTestMode()
  ? 'http://localhost:18000/#/download-list'
  : 'http://localhost:18000/#/download-list';

// Skill 商店
export const getSkillStoreUrl = () => isTestMode()
  ? 'http://localhost:18000/openapi/get/luna/hardware/gearlai/test/skill-store'
  : 'http://localhost:18000/openapi/get/luna/hardware/gearlai/prod/skill-store';
