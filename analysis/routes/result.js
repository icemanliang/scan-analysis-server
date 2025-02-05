const Router = require('koa-router');
const router = new Router();
const resultController = require('../controllers/result');
const validator = require('../middlewares/validator');

// 单应用单日期结果信息
router.post('/app', validator.result.app, resultController.getAppResult);

// 单应用prop区间数据
router.post('/app/props/trend', validator.result.appPropsTrend, resultController.getAppPropsTrend);

// 多部门多日期结果信息
router.post('/dept/props/trend', validator.result.deptPropsTrend, resultController.getDeptPropsTrend);

// 任务结果同步
router.post('/sync', validator.result.sync, resultController.sync);

module.exports = router; 