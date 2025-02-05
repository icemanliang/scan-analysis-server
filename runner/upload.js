const fs = require('fs');
const zlib = require('zlib');
const axios = require('axios');
const path = require('path');
const { accessToken, uploadUrl, contentType, resourcesDir } = require('./config');
const { execSync } = require('child_process');
const logger = require('./logger');

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
// 上传结果
const uploadResult = (result) => {
  return axios.post(uploadUrl, result, {
    headers: {
      'Content-Type': contentType,
      'x-token': accessToken
    }
  }).then((res) => {
    logger.info('upload result msg:', res.data.msg);
    return res.data;
  }).catch((error) => {
    logger.error('upload failed:', error);
  });
}
// 获取appId
const getAppId = (config, name) => {
  return config.info.apps.find(app => app.name === name).id;
}
// 获取repoName
const getRepoName = (config, name) => {
  const repo = config.info.apps.find(app => app.name === name).repo;
  return repo.split('/').pop().replace('.git', '');
}
// 压缩结果
const zip = (filePath) => {
  const zipBuffer = zlib.gzipSync(fs.readFileSync(filePath, 'utf8'));
  return zipBuffer.toString('base64');
}
// 格式结果
const formatResult = (taskId, taskCode, config, result) => {
  const scanResults = {
    task_id: taskId,
    task_code: taskCode,
    cost_time: result.scanTotalTime,
    task_log: zip(result.scanLogFile),
    app_results: []
  };
  
  result.scanResults.forEach((appResult) => {
    const resultContent = zip(appResult.resultFile);
    const logContent = zip(appResult.logFile);

    const zipResult = {
      app_id: getAppId(config, appResult.appName),
      cost_time: appResult.duration,
      app_log: logContent,
      commit_id: getCommitId(appResult.appName, getRepoName(config, appResult.appName)),
      result_json: resultContent
    };
    scanResults.app_results.push(zipResult);
  });

  return scanResults;
}

// 开始上传
const startUpload = async (taskId, taskCode, config, result) => {
  // 1. 格式结果 
  const formattedResult = formatResult(taskId, taskCode, config, result);
  // console.log('formatted result:', formattedResult);
  // 2. 上传结果
  await uploadResult(formattedResult);
}
  
module.exports = {
  startUpload
}