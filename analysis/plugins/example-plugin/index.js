const { getCache, setCache } = require('../../cache');
const { PrismaClient } = require('@prisma/client');
const logger = require('../../logger');

const prisma = new PrismaClient();

module.exports = {
  async handleRequest(ctx) {
    const cacheKey = `example-plugin:${JSON.stringify(ctx.request.query)}`;

    logger.info(`Handling request for example-plugin with cache key: ${cacheKey}`);

    try {
      // 尝试从缓存读取
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        logger.info(`Cache hit for key: ${cacheKey}`);
        ctx.body = cachedData;
        return;
      }

      logger.info(`Cache miss for key: ${cacheKey}, processing request...`);

      const application = await prisma.application.findUnique({
        where: { id: parseInt(ctx.query.appId, 10) }
      });

      if (!application) {
        logger.warn(`No application data found for appId: ${ctx.query.appId}`);
        ctx.status = 404;
        ctx.body = { error: 'No application data found for the given appId' };
        return;
      }

      const result = {
        message: "Hello from example-plugin!",
        application: application,
        timestamp: new Date()
      };

      // 将结果存入缓存，TTL 为 config.CACHE_TTL 秒
      await setCache(cacheKey, result, config.CACHE_TTL);

      logger.info(`Processed result for key: ${cacheKey} and stored in cache`);
      ctx.body = result;
    } catch (error) {
      logger.error(`Error handling request in example-plugin - ${error.message}`);
      throw error;
    }
  }
};