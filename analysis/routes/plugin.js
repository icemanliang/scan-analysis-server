const Router = require('koa-router');
const router = new Router();
const pluginController = require('../controllers/plugin');
const validator = require('../middlewares/validator');

router.post('/add', validator.plugin.add, pluginController.add);
router.post('/list', validator.plugin.list, pluginController.list);
router.post('/remove', validator.plugin.remove, pluginController.remove);
router.post('/update', validator.plugin.update, pluginController.update);

module.exports = router; 