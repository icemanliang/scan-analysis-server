const os = require('os');
const path = require('path');

module.exports = {
  MAX_MEMORY_THRESHOLD: 0.8, // 80%
  DEFAULT_MAX_PARALLEL: Math.max(os.cpus().length - 1, 1), // 至少1个进程
  FINAL_RESULT_DIR: path.resolve(__dirname, '../scan-results'),
  MEMORY_CHECK_INTERVAL: 5000, // 5秒间隔记录内存使用情况
  SERVER_CONFIG_URL: 'https://example.com/config', // 服务器上配置的URL
  REPO_CONFIG_URL: 'https://example.com/repos', // 获取仓库配置的URL
  WEBHOOK_PORT: 3000, // WebHook服务器监听端口
  WEBHOOK_TOKEN: 'your-secret-token', // 用于验证WebHook请求的Token
//   OSS_CONFIG: {
//     region: 'oss-cn-hangzhou',
//     accessKeyId: 'your-access-key-id',
//     accessKeySecret: 'your-access-key-secret',
//     bucket: 'your-bucket-name'
//   },
  DB_CONFIG: {
    host: 'your-database-host',
    user: 'your-database-username',
    password: 'your-database-password',
    database: 'your-database-name'
  }
};