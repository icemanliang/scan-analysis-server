const { PrismaClient } = require('@prisma/client');
const { getCache, setCache } = require('./cache');
const logger = require('./logger');

const prisma = new PrismaClient();

const processAnalysisResult = async (appId, analysisResult) => {
  try {
    // 检查是否有缓存结果
    const cacheKey = `analysis:${appId}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      logger.info(`Cache hit for analysis: ${appId}`);
      return cachedData;
    }

    logger.info(`Cache miss for analysis: ${appId}, processing...`);

    // 将分析结果保存到数据库中
    const application = await prisma.application.update({
      where: { id: parseInt(appId, 10) },
      data: {
        scanConfig: analysisResult
      }
    });

    // 将结果存入缓存，TTL 为 3600 秒
    await setCache(cacheKey, application, 3600);

    logger.info(`Processed and cached analysis result for application ${appId}`);
    return application;
  } catch (error) {
    logger.error(`Error processing analysis result for application ${appId} - ${error.message}`);
    throw error;
  }
};

module.exports = {
  processAnalysisResult,
};
