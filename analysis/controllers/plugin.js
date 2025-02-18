const PluginModel = require('../models/plugin');
const logger = require('../logger');

class PluginController {
  async add(ctx) {
    logger.info('add plugin.');
    const { plugin_name, plugin_desc, plugin_config, plugin_status = 1 } = ctx.request.body;
    
    const createData = {
      pluginName: plugin_name,
      pluginDesc: plugin_desc,
      pluginConfig: plugin_config,
      pluginStatus: plugin_status,
      isDelete: 0
    };

    await PluginModel.create(createData);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: null
    };
  }

  async list(ctx) {
    logger.info('list plugin.');
    const query = ctx.request.body;
    // console.log(query);
    const result = await PluginModel.list(query);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: result
    };
  }

  async update(ctx) {
    logger.info('update plugin.');
    const { id, plugin_status, plugin_name, plugin_desc, plugin_config } = ctx.request.body;
    
    const updateData = {
      pluginStatus: plugin_status,
      pluginName: plugin_name,
      pluginDesc: plugin_desc,
      pluginConfig: plugin_config
    };

    await PluginModel.update(id, updateData);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: null
    };
  }

  async remove(ctx) {
    logger.info('remove plugin.');
    const { id } = ctx.request.body;
    // console.log(id);
    await PluginModel.remove(id);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: null
    };
  }
}

module.exports = new PluginController(); 