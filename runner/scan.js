const path = require('path');
const scan = require('scan-analysis-lib');
const fs = require('fs');
const { execSync } = require('child_process');
const { resourcesDir, scanResultDir, maxWorkerNum, logDir } = require('./config');
const { pullCode } = require('./pull');
const logger = require('./logger');
// 拉取代码
const getCodes = async (taskConfig) => {
  const repoConfigs = taskConfig.apps.map(app => ({
    repo: app.repo,
    branch: app.branch,
    localPath: path.join(__dirname, '../', resourcesDir)
  }));
  // console.info('repoConfigs:', JSON.stringify(repoConfigs));
  const pullResult = await pullCode(repoConfigs);
  // console.info('pull result:', pullResult);
  // 如果拉取代码失败，则退出
  if (pullResult.some(repo => repo.status === 'error')) {
    logger.error('repo', repo.name, 'pull code failed');
    return false;
  }
  logger.info('pull code all success');
  return true
}

// 获取commitId
const getCommitId = (appName, repoName) => {
  const appPath = path.join(__dirname, '../', resourcesDir, repoName);

  try {
    // 执行 git 命令获取最新的 commit ID
    const commitId = execSync('git rev-parse HEAD', { cwd: appPath }).toString().trim().slice(0, 8);
    return commitId;
  } catch (error) {
    logger.error(`获取 ${appName} 的 commit ID 时发生错误:`, error);
    return null;
  }
}

// 解析JS对象
const parseJsObject = (str) => {
  try {
    return (new Function(`return ${str}`))();
  } catch (error) {
    logger.error('解析配置:', str);
    logger.error('解析配置对象失败:', error);
    return {};
  }
}

// 生成扫描配置
const generateScanConfig = (taskConfig) => {
  return {
    resultDir: scanResultDir,
    maxWorkerNum,
    sources: taskConfig.apps.map(app => ({
      appName: app.name,
      baseDir: path.join(__dirname, '../', resourcesDir, `${app.repo.split('/').pop().replace('.git', '')}`),
      codeDir: parseJsObject(app.config).codeDir,
      buildDir: parseJsObject(app.config).buildDir,
      aliasConfig: parseJsObject(app.config).aliasConfig
    })),
    plugins: taskConfig.plugins.map(plugin => ({
      name: plugin.name,
      config: parseJsObject(plugin.config)
    }))
  }
}

// 写入日志(或上传日志)
const writeLog = (taskConfig) => {
  const log = taskConfig.apps.map(app => ({
    appName: app.name,
    commitId: getCommitId(app.name, app.repo.split('/').pop().replace('.git', ''))
  }));
  // 生成时间戳文件名
  const timestamp = new Date();
  const fileName = `${timestamp.getFullYear()}${(timestamp.getMonth() + 1).toString().padStart(2, '0')}${
    timestamp.getDate().toString().padStart(2, '0')
  }_${
    timestamp.getHours().toString().padStart(2, '0')}${
    timestamp.getMinutes().toString().padStart(2, '0')}${
    timestamp.getSeconds().toString().padStart(2, '0')}`;

  // 在日志内容中添加时间信息
  const scanInfo = {};
  log.forEach(item => {
    scanInfo[item.appName] = item.commitId;
  });
  const logContent = {
    scanTime: fileName,
    scanInfo
  };

  // 确保日志目录存在
  const logDirPath = path.join(__dirname, '../', logDir);
  if (!fs.existsSync(logDirPath)) {
    fs.mkdirSync(logDirPath);
  }

  // 写入日志文件
  fs.writeFileSync(
    path.join(logDirPath, `${fileName}.json`),
    JSON.stringify(logContent, null, 2)
  );
}

// 开始扫描
const startScan = async (taskConfig) => {
  logger.info('start scan task');
  try {
    // 1. 拉取代码
    const pullResult = await getCodes(taskConfig);
    if (!pullResult) throw new Error('pull code failed, task stop');  // 拉取代码失败，退出
    // 2. 扫描配置
    const scanConfig = generateScanConfig(taskConfig);
    // console.log('scan config:', JSON.stringify(scanConfig));
    // 3. 扫描代码
    const scanResult = await scan(scanConfig);
    // 4. 写入日志(或上传日志)
    writeLog(taskConfig);
    return scanResult;
  } catch (error) {
    logger.error('task failed:', error.stack);
  }
}

module.exports = {
  startScan
}