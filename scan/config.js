const path = require('path');

module.exports = {
  FINAL_RESULT_DIR: path.resolve(__dirname, '../scan-results'),
  WEBHOOK_PORT: 3000,           
  WEBHOOK_TOKEN: 'your-secret-token'
};