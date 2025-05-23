const TaskModel = require('../models/task');
const { runnerApi, accessToken } = require('../config');
const axios = require('axios');
const logger = require('../logger');

class TaskController {
  async add(ctx) {
    logger.info('add task.');
    const { app_ids, plugin_ids } = ctx.request.body;
    // 创建任务
    const task = await TaskModel.create({ appIds: app_ids, pluginIds: plugin_ids });
    // console.log('task', task);
    // 通知runner任务开始
    const taskId = task.id;
    const taskCode = task.taskCode;
    const res = await axios.post(runnerApi, {
      taskId: taskId,
      taskCode: taskCode
    },{
      headers: {
        'Content-Type': 'application/json',
        'x-token': accessToken
      }
    });
    // logger.info('runner response code:', res.data.code);
    // 更新任务状态
    if (res.data.code == 0) {
      await TaskModel.update(taskId, { taskStatus: 1 });
      // 返回结果
      ctx.body = {
        code: 0,
        msg: 'create task success',
        data: null
      };
    } else if (res.data.code == 1002) {
      // 返回结果
      ctx.body = {
        code: 1002,
        msg: 'Analysis task already running',
        data: null
      };
    } else {
      // 返回结果
      ctx.body = {
        code: 1010,
        msg: 'task create failed',
        data: null
      };
    }
  }

  async list(ctx) {
    logger.info('list task.');
    const query = ctx.request.body;
    // console.log(query);
    const result = await TaskModel.list(query);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: result
    };
  }

  async remove(ctx) {
    logger.info('remove task.');
    const { id } = ctx.request.body;
    // console.log(id);
    await TaskModel.remove(id);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: null
    };
  }

  async getById(ctx) {
    logger.info('get task by id.');
    const { id } = ctx.request.body;
    // console.log(id);
    const task = await TaskModel.getById(id);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: task
    };
  }

  async discard(ctx) {
    logger.info('discard task.');
    const { id } = ctx.request.body;
    // console.log(id);
    await TaskModel.update(id, { taskStatus: -1 });
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: null
    };
  }
}

module.exports = new TaskController(); 