const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const winston = require('winston');
const scan = require('scan-analysis-lib');
const path = require('path');
const config = require('./config');


const app = new Koa();
const router = new Router();

let isRunning = false;

// 配置日志记录
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level} ${message}`)
  ),
  transports: [
    new winston.transports.File({ filename: 'webserver.log' }),
    new winston.transports.Console()
  ]
});

// 从服务器拉取仓库配置
async function fetchRepoConfig() {
  return new Promise((resolve, reject)=>{
    // 创建数据库文件
    const dbPath = path.resolve(__dirname, '../database.db');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to connect to the database:', err.message);
      } else {
        console.log('Connected to the SQLite database');
      }
    });

    // 获取应用配置信息
    db.get('SELECT * FROM applications', (err, row) => {
      if (err) {
        logger.error(`Error querying applications table: ${err.message}`);
        reject(err)
        return;
      }
  
      if (!row) {
        logger.warn(`No application data found`);
        reject(`No application data found`)
        return;
      }
      
      logger.info(`Successfully fetched application data`);
      logger.info(JSON.stringify(row));
      
      const repos = Array.isArray(row) ? row.map((item)=>{
        return item.repo_url
      }) : [row.repo_url];
      logger.info('Successfully fetched and set repository configuration.');
      resolve(repos);
    });
  })
}

router.get('/webhook', async (ctx) => {
  // const { token } = ctx.request.body;

  // if (token !== config.WEBHOOK_TOKEN) {
  //   ctx.status = 403;
  //   ctx.body = 'Forbidden';
  //   logger.warn('Received request with invalid token.');
  //   return;
  // }

  if (isRunning) {
    ctx.status = 429;
    ctx.body = 'Analysis already running';
    logger.info('Received request while analysis is already running.');
    return;
  }

  try{
    // const repos = await fetchRepoConfig();
    const repos = [
      'https://github.sheincorp.cn/icemanliang/project-app1.git',
      'https://github.sheincorp.cn/icemanliang/project-app2.git',
      'https://github.sheincorp.cn/icemanliang/project-app3.git',
      'https://github.sheincorp.cn/icemanliang/project-app4.git'
    ];
    isRunning = true;
    ctx.status = 200;
    ctx.body = 'OK';
    logger.info('Received valid request, starting analysis...');
    // 启动分析流程
    scan(repos).finally(()=>{
      isRunning = false;
    });
  }catch(e){
    ctx.status = 200;
    ctx.body = 'error';
    logger.info('error stop analysis.');
  }
});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());


app.listen(config.WEBHOOK_PORT, () => {
    logger.info(`Web server running at http://localhost:${config.WEBHOOK_PORT}/`);
});
