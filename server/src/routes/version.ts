import { Router } from 'express';
import { getLatestVersion, shouldUpdate } from '@/utils/versionManager';

const router = Router();

/**
 * 检查更新
 * GET /api/v1/version/check?currentVersion=2.0.1
 */
router.get('/check', (req, res) => {
  try {
    const { currentVersion } = req.query;

    if (!currentVersion || typeof currentVersion !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'currentVersion parameter is required',
      });
    }

    const latestVersion = getLatestVersion();
    const needsUpdate = shouldUpdate(currentVersion, latestVersion.version);

    res.json({
      success: true,
      data: {
        currentVersion,
        latestVersion: latestVersion.version,
        versionCode: latestVersion.versionCode,
        needsUpdate,
        forceUpdate: latestVersion.forceUpdate,
        releaseDate: latestVersion.releaseDate,
        downloadUrl: latestVersion.downloadUrl,
        updateLog: latestVersion.updateLog,
      },
    });
  } catch (error) {
    console.error('检查更新失败:', error);
    res.status(500).json({
      success: false,
      error: '检查更新失败',
    });
  }
});

/**
 * 获取最新版本信息
 * GET /api/v1/version/latest
 */
router.get('/latest', (req, res) => {
  try {
    const latestVersion = getLatestVersion();

    res.json({
      success: true,
      data: latestVersion,
    });
  } catch (error) {
    console.error('获取版本信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取版本信息失败',
    });
  }
});

export default router;
