const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient();

const processAnalysisResult = async (appId, analysisResult) => {
  try {
    // 将分析结果保存到数据库中
    const application = await prisma.application.update({
      where: { id: parseInt(appId, 10) },
      data: {
        scanConfig: analysisResult
      }
    });

    logger.info(`Processed analysis result for application ${appId}`);
    return application;
  } catch (error) {
    logger.error(`Error processing analysis result for application ${appId} - ${error.message}`);
    throw error;
  }
};

module.exports = {
  processAnalysisResult,
};
