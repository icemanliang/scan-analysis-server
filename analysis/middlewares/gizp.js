const zlib = require('zlib');

// 解压json
function unzipJson(resultJson) {
  return zlib.gunzipSync(Buffer.from(resultJson, 'base64')).toString();
}

module.exports = {
  unzipJson
};  