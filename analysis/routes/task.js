const Router = require('koa-router');
const router = new Router();
const taskController = require('../controllers/task');
const validator = require('../middlewares/validator');

router.post('/add', validator.task.add, taskController.add);
router.post('/list', validator.task.list, taskController.list);
router.post('/remove', validator.task.remove, taskController.remove);
router.post('/getById', validator.task.getById, taskController.getById);
router.post('/discard', validator.task.discard, taskController.discard);

module.exports = router; 