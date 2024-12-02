const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const { PrismaClient } = require('@prisma/client');
const config = require('./config');
const logger = require('./logger');

const app = new Koa();
const router = new Router();
const prisma = new PrismaClient();

// API 获取应用信息
router.get('/api/applications/:appId', async (ctx) => {
  const appId = ctx.params.appId;
  logger.info(`API /api/applications/${appId} called`);

  try {
    const application = await prisma.application.findUnique({
      where: { id: parseInt(appId, 10) },
      include: { owner: true },
    });

    if (!application) {
      logger.warn(`No application data found for appId: ${appId}`);
      ctx.status = 404;
      ctx.body = { error: 'No application data found for the given appId' };
      return;
    }

    logger.info(`Successfully fetched application data for appId: ${appId}`);
    ctx.status = 200;
    ctx.body = application;
  } catch (error) {
    logger.error(`Error in /api/applications/${appId} - ${error.message}`);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// API 获取用户信息
router.get('/api/users/:userId', async (ctx) => {
  const userId = ctx.params.userId;
  logger.info(`API /api/users/${userId} called`);

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
    });

    if (!user) {
      logger.warn(`No user data found for userId: ${userId}`);
      ctx.status = 404;
      ctx.body = { error: 'No user data found for the given userId' };
      return;
    }

    logger.info(`Successfully fetched user data for userId: ${userId}`);
    ctx.status = 200;
    ctx.body = user;
  } catch (error) {
    logger.error(`Error in /api/users/${userId} - ${error.message}`);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// 通用日志记录
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// 登陆路由
app.use(bodyParser());

// 应用根路由中间件
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = config.API_PORT;
app.listen(PORT, () => {
  logger.info(`Web Server running at http://localhost:${PORT}/`);
});
