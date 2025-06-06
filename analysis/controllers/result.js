const ResultModel = require('../models/result');
const TaskModel = require('../models/task');
const logger = require('../logger');
const { sendEmail, sendBot } = require('../notice');
const config = require('../config');
class ResultController {
  // 获取单应用单批次分析结果
  async getAppResult(ctx) {
    logger.info('get app result.');
    const query = ctx.request.body;
    // console.log(query);
    const result = await ResultModel.getAppResult(query);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: result
    };
  }

  // 获取单应用多日期结果趋势信息
  async getAppTrend(ctx) {
    logger.info('get app trend.');
    const query = ctx.request.body;
    // console.log(query);
    const result = await ResultModel.getAppTrend(query);
    
    ctx.body = {
      code: 0,
      msg: 'OK', 
      data: result
    };
  }

  // 获取部门单批次分析结果
  async getDeptResult(ctx) {
    logger.info('get dept result.');
    const query = ctx.request.body;
    // console.log(query);
    const result = await ResultModel.getDeptResult(query);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: result
    };
  }

  // 获取部门多日期结果趋势信息
  async getDeptTrend(ctx) {
    logger.info('get dept trend.');
    const query = ctx.request.body;
    // console.log(query);
    const result = await ResultModel.getDeptTrend(query);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: result
    };
  }

  // 同步任务结果
  async sync(ctx) {
    logger.info('sync result from runner server.');
    const data = ctx.request.body;
    const { task_id, task_code, task_log, cost_time } = data;

    // 获取任务, 并检查任务状态, 校验任务code是否一致
    const task = await TaskModel.getById(task_id);
    if (!task) {
      logger.error('task not found.');
      ctx.body = {
        code: 1001,
        msg: 'task not found.',
        data: null
      };
      return;
    }
    if (task.task_status !== 1) {
      logger.error('task status is not 1.');
      ctx.body = {
        code: 1002,
        msg: 'task status is not 1.',
        data: null
      };
      return;
    }
    if (task.task_code !== task_code) {
      logger.error('task code not match.');
      ctx.body = {
        code: 1003,
        msg: 'task code not match.',
        data: null
      };
      return;
    }

    // 同步分析结果
    await ResultModel.sync({
      task_id: task.id,
      task_date: task.task_date,
      app_results: data.app_results
    });
    logger.info('sync result success.');
    // 更新任务状态
    await TaskModel.update(task_id, { 
        taskStatus: 2, 
        taskLog: task_log,
        costTime: cost_time,
    });
    // 发送邮件通知
    if (config.emailNotice) {
      await sendEmail(
        task.notify_users,
        '巡检任务完成通知', 
        `任务: ${task_id} 已完成，耗时: ${cost_time} 秒。`
      );
    }
    // 发送Bot通知
    if (config.botNotice) {
      await sendBot(
        '巡检任务完成通知',
        `任务: ${task_id} 已完成，耗时: ${cost_time} 秒。`
      );
    }
    logger.info('update task status success.');
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: null
    };
  }
}

module.exports = new ResultController(); 