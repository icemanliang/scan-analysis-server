const Router = require('koa-router');
const router = new Router();
const resultController = require('../controllers/result');
const validator = require('../middlewares/validator');

// 单应用单日期结果信息
router.post('/app', validator.result.app, resultController.getAppResult);

// 单应用prop区间数据
router.post('/app-trend', validator.result.appTrend, resultController.getAppTrend);

// 单部门单日期结果信息
router.post('/dept', validator.result.dept, resultController.getDeptResult);

// 多部门多日期结果信息
router.post('/dept-trend', validator.result.deptTrend, resultController.getDeptTrend);

// 任务结果同步
router.post('/sync', validator.result.sync, resultController.sync);

module.exports = router; 