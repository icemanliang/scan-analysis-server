const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const applicationRouter = require('./routes/application');
const departmentRouter = require('./routes/department');
const pluginRouter = require('./routes/plugin');
const taskRouter = require('./routes/task');
const resultRouter = require('./routes/result');
const { serverPort } = require('./config');
const logger = require('./logger');

// 创建Koa应用和路由器
const app = new Koa();
const router = new Router();

// 添加中间件
app.use(bodyParser());
app.use(require('./middlewares/error-handler'));

// 注册路由
router.use('/api/application', applicationRouter.routes());
router.use('/api/dept', departmentRouter.routes());
router.use('/api/plugin', pluginRouter.routes());
router.use('/api/task', taskRouter.routes());
router.use('/api/result', resultRouter.routes());

// 使用路由器
app.use(router.routes())
app.use(router.allowedMethods());

// 启动服务器
app.listen(serverPort, () => {
  logger.info(`analysis server running at http://localhost:${serverPort}/`);
});