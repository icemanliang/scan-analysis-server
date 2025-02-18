module.exports = {
  // 分析服务运行端口
  serverPort: 3000,
  // 分析服务通信令牌
  accessToken: 'your-secret-token',
  // 分析服务通信地址
  runnerApi: 'http://localhost:4000/task/run',
  // 日志目录
  logDir: 'logs',
  // 日志文件名
  logFileName: 'analysis.log',
  // 是否开启邮件通知
  emailNotice: false,
  // 邮件通知
  email: {
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@example.com',
      pass: 'your-password'
    },
    linkUrl: 'your-link-url'
  },
  // 是否开启Bot通知
  botNotice: false,
  // Bot通知
  bot: {
    webhookUrl: 'your-bot-webhook-url',
    linkUrl: 'your-link-url'
  }
};
