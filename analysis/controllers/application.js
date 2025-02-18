const ApplicationModel = require('../models/application');
const logger = require('../logger');

class ApplicationController {
  async add(ctx) {
    logger.info('add application.');
    const data = ctx.request.body;
    
    const createData = {
      appName: data.app_name,
      appRepo: data.app_repo,
      appBranch: data.app_branch,
      appTags: data.app_tags?.join(','),
      appDesc: data.app_desc,
      appOwner: data.app_owner,
      appConfig: data.app_config,
      appStatus: data.app_status ? 1 : 0,
      isDelete: 0
    };

    await ApplicationModel.create(createData);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: null
    };
  }

  async list(ctx) {
    logger.info('list application.');
    const query = ctx.request.body;
    const result = await ApplicationModel.list(query);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: result
    };
  }

  async update(ctx) {
    logger.info('update application.');
    const data = ctx.request.body;

    const updateData = {
      appName: data.app_name,
      appRepo: data.app_repo,
      appBranch: data.app_branch,
      appTags: data.app_tags?.join(','),
      appDesc: data.app_desc,
      appOwner: data.app_owner,
      appConfig: data.app_config,
      appStatus: data.app_status ? 1 : 0
    };

    await ApplicationModel.update(id, updateData);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: null
    };
  }

  async remove(ctx) {
    logger.info('remove application.');
    const { id } = ctx.request.body;
    await ApplicationModel.remove(id);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: null
    };
  }
}

module.exports = new ApplicationController(); 