const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const path = require('path');
const fs = require('fs');
const { runnerPort, accessToken, getConfigUrl, contentType, scanResultDir } = require('./config');
const { startScan } = require('./scan');
const { startUpload } = require('./upload');
const axios = require('axios');
const logger = require('./logger');

// 初始化koa
const app = new Koa();
const router = new Router();

// 是否正在执行扫描任务
let isRunning = false;

// 获取任务配置
const getConfig = async (taskId) => {
  return axios.post(getConfigUrl, { id: taskId }, {
    headers: {
      'Content-Type': contentType,
      'x-token': accessToken
    }
  }).then((res) => {
    return res.data;
  }).catch((error) => {
    console.error('upload failed:', error);
  });
}

router.post('/task/run', async (ctx) => {
  logger.info('request from analysis server, start deal task.');
  const { 'x-token': token } = ctx.request.headers;
  const { taskId, taskCode } = ctx.request.body;

  // 1. 验证token
  if (token !== accessToken) {
    ctx.status = 403;
    ctx.body = {
      code: '1001',
      msg: 'Forbidden'
    };
    logger.error('Received request with invalid token.');
    return;
  }

  // 2. 验证任务是否正在执行
  if (isRunning) {  
    ctx.status = 500;
    ctx.body = {
      code: '1002',
      msg: 'Analysis already running'
    };
    logger.error('Received request while analysis is already running.');
    return;
  }

  // 3. 获取任务配置
  let taskConfig = null;
  try{
    taskConfig = await getConfig(taskId);
  }catch(e){
    ctx.status = 510;
    ctx.body = {
      code: '1003',
      msg: 'error get config.'
    };
    logger.error('error get config.');
    return;
  }
  if(!taskConfig){
    ctx.status = 520;
    ctx.body = {
      code: '1004',
      msg: 'error get config.'
    };
    logger.error('error get config.');
    return;
  }

  // 4. 删除scan-results目录
  try{
    const scanResultDirPath = path.join(__dirname, '../', scanResultDir);
    if (fs.existsSync(scanResultDirPath)) {
      fs.rmSync(scanResultDirPath, { 
        recursive: true,
        force: true  // 添加 force 选项以处理权限问题
      });
    }
  }catch(e){
    ctx.status = 530;
    ctx.body = {
      code: '1005',
      msg: 'error delete scan-results dir.'
    };
    logger.error('error delete scan-results dir.');
    return;
  }

  // 5. 启动分析流程
  isRunning = true;
  ctx.status = 200;
  ctx.body = {
    code: '0',
    msg: 'OK'
  };
  logger.info('Received task request, starting analysis...');
  
  startScan(taskConfig).then((scanResult)=>{
    startUpload(taskId, taskCode, taskConfig, scanResult);
  }).catch((error)=>{
    logger.error('error stop analysis.');
  }).finally(()=>{
    isRunning = false;
  });
});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(runnerPort, () => {
  logger.info(`runner server running at http://localhost:${runnerPort}/`);
});
