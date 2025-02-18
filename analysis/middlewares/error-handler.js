module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      code: err.status || 500,
      msg: err.message || '服务器内部错误'
    };
    
    // 记录错误日志
    ctx.app.emit('error', err, ctx);
  }
}; 