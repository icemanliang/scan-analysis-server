const OSS = require('ali-oss');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const config = require('./config');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level} ${message}`)
  ),
  transports: [
    new winston.transports.File({ filename: 'post-process.log' }),
    new winston.transports.Console()
  ]
});

const ossClient = new OSS(config.OSS_CONFIG);

const processResults = async () => {
  const resultFilesDir = config.FINAL_RESULT_DIR;
  const manifestPath = path.join(resultFilesDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  const dbConnection = await mysql.createConnection(config.DB_CONFIG);
  
  try {
    for (const { repoName, resultFile } of manifest) {
      const localFilePath = path.join(resultFilesDir, resultFile);
      const fileKey = `analysis-results/${repoName}.json`;
      
      // 上传文件到OSS
      const result = await ossClient.put(fileKey, localFilePath);

      // 构建插入数据库的SQL查询
      const insertSQL = `
        INSERT INTO analysis_results (repo_name, result_url) 
        VALUES (?, ?)
      `;
      const resultUrl = result.url;  // OSS返回的文件URL

      // 插入数据库
      await dbConnection.execute(insertSQL, [repoName, resultUrl]);

      logger.info(`Uploaded ${repoName} results to OSS and saved URL to database.`);
    }
  } catch (error) {
    logger.error(`Failed to process and save results: ${error.message}`);
  } finally {
    await dbConnection.end();
  }
};

module.exports = {
  processResults
};
