/**
 * 版本管理配置
 */

export interface VersionInfo {
  version: string;           // 版本号，如 "2.0.2"
  versionCode: number;       // 版本代码，如 4
  releaseDate: string;       // 发布日期，如 "2025-01-15"
  downloadUrl?: string;      // APK 下载链接（可选）
  updateLog: string;         // 更新日志
  forceUpdate: boolean;      // 是否强制更新
}

/**
 * 获取最新版本信息
 *
 * 注意：这里目前是硬编码配置，实际生产环境中应该：
 * 1. 从数据库读取版本信息
 * 2. 或者从配置文件读取
 * 3. 或者从外部 API 获取
 */
export function getLatestVersion(): VersionInfo {
  return {
    version: "2.0.2",
    versionCode: 4,
    releaseDate: "2025-01-15",
    downloadUrl: "", // TODO: 替换为实际的 APK 下载地址
    updateLog: `🎉 全新版本 V2.0.2

✨ 新功能：
• 多主题选择：支持粉红/蓝色/绿色/灰色四种主题风格
• 深色/浅色模式切换：可跟随系统或固定模式
• 默认分类自动创建：新用户注册时自动生成12个默认分类

🔒 安全优化：
• 分类数据隔离：每个用户只能管理自己的分类
• 权限验证：防止跨用户操作分类

💡 体验提升：
• 修复版本号显示问题：动态读取配置文件版本号
• 优化分类管理：更流畅的增删改体验`,
    forceUpdate: false,
  };
}

/**
 * 比较版本号
 * @param currentVersion 当前版本，如 "2.0.1"
 * @param latestVersion 最新版本，如 "2.0.2"
 * @returns true 表示需要更新，false 表示不需要
 */
export function shouldUpdate(currentVersion: string, latestVersion: string): boolean {
  const parseVersion = (v: string) => {
    const parts = v.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
    };
  };

  const current = parseVersion(currentVersion);
  const latest = parseVersion(latestVersion);

  // 比较主版本号
  if (latest.major > current.major) return true;
  if (latest.major < current.major) return false;

  // 比较次版本号
  if (latest.minor > current.minor) return true;
  if (latest.minor < current.minor) return false;

  // 比较补丁号
  if (latest.patch > current.patch) return true;

  return false;
}
