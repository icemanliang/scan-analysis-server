const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const OSS = require('ali-oss');
const fs = require('fs');
const path = require('path');
const jwt = require('koa-jwt');
const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const config = require('./config');
const loginRouter = require('./login');
const logger = require('./logger');

const app = new Koa();
const router = new Router();
const prisma = new PrismaClient();

const ossClient = new OSS(config.OSS_CONFIG);

// 动态加载插件
const loadPlugins = (pluginPath, router) => {
  const pluginsDir = path.resolve(__dirname, pluginPath);
  const plugins = fs.readdirSync(pluginsDir).filter(file => fs.statSync(path.join(pluginsDir, file)).isDirectory());

  plugins.forEach(plugin => {
    const pluginDir = path.join(pluginsDir, plugin);
    const configPath = path.join(pluginDir, 'config.json');
    const pluginHandlerPath = path.join(pluginDir, `${plugin}.js`);

    if (fs.existsSync(configPath) && fs.existsSync(pluginHandlerPath)) {
      const pluginConfig = require(configPath);
      const pluginHandler = require(pluginHandlerPath);

      pluginConfig.apis.forEach(api => {
        const { path, method, role } = api;
        const middleware = [jwt({ secret: config.JWT_SECRET }), authorize(role)];

        router[method](path, ...middleware, async (ctx, next) => {
          logger.info(`Executing plugin: ${pluginConfig.name}, API: ${path}`);
          try {
            await pluginHandler.handleRequest(ctx);
            logger.info(`Plugin execution for ${pluginConfig.name}, API: ${path} completed.`);
          } catch (error) {
            logger.error(`Error in plugin: ${pluginConfig.name}, API: ${path} - ${error.message}`);
            throw error;
          }
        });

        logger.info(`Registered plugin API: ${method.toUpperCase()} ${path} [Roles: ${role.join(', ')}]`);
      });
    } else {
      logger.warn(`Plugin directory "${plugin}" is missing config.json or handler file.`);
    }
  });
};

// 授权中间件：根据角色检查权限
function authorize(allowedRoles) {
  return async (ctx, next) => {
    const user = ctx.state.user;
    if (allowedRoles.includes(user.role)) {
      await next();
    } else {
      ctx.status = 403;
      ctx.body = { error: 'Forbidden' };
    }
  };
}

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
app.use(loginRouter.routes());
app.use(loginRouter.allowedMethods());

// 加载插件路由
loadPlugins('plugins', router);

// 应用根路由中间件
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = config.API_PORT;
app.listen(PORT, () => {
  logger.info(`Web Server running at http://localhost:${PORT}/`);
});
