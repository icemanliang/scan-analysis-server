const Router = require('koa-router');
const router = new Router();
const departmentController = require('../controllers/department');
const validator = require('../middlewares/validator');

router.post('/add', validator.department.add, departmentController.add);
router.post('/list', validator.department.list, departmentController.list);
router.post('/remove', validator.department.remove, departmentController.remove);
router.post('/update', validator.department.update, departmentController.update);

module.exports = router; 