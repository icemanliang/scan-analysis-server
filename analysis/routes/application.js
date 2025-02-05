const Router = require('koa-router');
const router = new Router();
const applicationController = require('../controllers/application');
const validator = require('../middlewares/validator');

router.post('/add', validator.application.add, applicationController.add);
router.post('/list', validator.application.list, applicationController.list);
router.post('/remove', validator.application.remove, applicationController.remove);
router.post('/update', validator.application.update, applicationController.update);

module.exports = router; 