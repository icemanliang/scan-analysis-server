const path = require('path');

module.exports = {
  // 扫描服务运行端口
  runnerPort: 4000,           
  // 分析服务通信令牌
  accessToken: 'your-secret-token',
  // 获取配置地址
  getConfigUrl: 'http://localhost:3000/api/task/getById',
  // 上传结果地址
  uploadUrl: 'http://localhost:3000/api/result/sync',
  // 上传结果contentType
  contentType: 'application/json; charset=utf-8',
  // 结果目录
  resourcesDir: "resources",
  // 扫描结果目录
  scanResultDir: "scan-results",
  // 日志目录
  logDir: "logs",
  // 日志文件名
  logFileName: 'runner.log',
  // 最大并发数
  maxWorkerNum: 4
};
