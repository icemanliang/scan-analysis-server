javascript
module.exports = {
  // Redis 配置
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  REDIS_PASSWORD: '',
  REDIS_DB: 0,
  CACHE_TTL: 3600,  // 缓存时间（秒）

  // JWT
  JWT_SECRET: 'your-secret-key',

  // 角色配置
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
  },

  // 权限配置
  PERMISSIONS: {
    '/api/analysis/:appId': ['ADMIN', 'USER'],
    '/api/admin-only': ['ADMIN']
  },

  WEBHOOK_PORT: 3000,
  API_PORT: 3001,
};
