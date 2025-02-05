const { PrismaClient } = require('@prisma/client');
const { unzipJson } = require('../middlewares/gizp');
const prisma = new PrismaClient();

class ResultModel {
  // 获取单应用单日期分析结果
  async getAppResult(query) {
    const { app_id, keys, task_id } = query;
    
    const results = await prisma.result.findMany({
      where: {
        appId: app_id,
        taskId: task_id,
        isDelete: 0
      },
      select: {
        commitId: true,
        resultJson: true
      },
      orderBy: {
        taskDate: 'desc'
      }
    });

    if (!results.length) return null;

    const resultJson = results[0]?.resultJson ? JSON.parse(unzipJson(results[0].resultJson)) : null;

    // 处理结果数据
    const formattedResult = {
      baseInfo: {
        commitId: results[0]?.commitId,
      }
    };

    // 根据请求的keys添加对应属性
    keys.forEach(key => {
      if (resultJson) {
        formattedResult[key] = resultJson[key] || null;
      }
    });

    return formattedResult;
  }

  // 获取单应用分析结果趋势
  async getAppPropsTrend(query) {
    const { app_id, keys, props, start_date, end_date } = query;

    const results = await prisma.$queryRaw`
        SELECT * FROM fdas_result 
        WHERE app_id = ${app_id} 
        AND task_date >= ${start_date}
        AND task_date <= ${end_date}
        AND is_delete = 0
        ORDER BY task_date ASC
    `;
    if (!results.length) return null;

    // 初始化返回结果结构
    const formattedResult = {};
    keys.forEach(key => {
      formattedResult[key] = {};
      props.forEach(prop => {
        formattedResult[key][prop] = [];
      });
    });

    // 处理每个时间点的数据
    results.forEach(result => {
      const timestamp = new Date(result.task_date).getTime().toString();
      const resultJson = result.result_json ? unzipJson(result.result_json) : null;

      keys.forEach(key => {
        props.forEach(prop => {
          const value =  JSON.parse(resultJson)[key]?.[prop] ?? null;
          formattedResult[key][prop].push({
            name: timestamp,
            value: value
          });
        });
      });
    });

    return formattedResult;
  }

  // 获取多部门分析结果趋势
  async getDeptPropsTrend(query) {
    const { dept_ids, start_date, end_date, props = [], keys = ['qualityInfo'] } = query;

    // 获取部门下的应用
    const departments = await prisma.department.findMany({
      where: {
        id: {
          in: dept_ids
        },
        isDelete: 0
      }
    });

    const appIds = departments
      .map(dept => dept.appIds?.split(',').map(Number) || [])
      .flat();

    // 查询结果
    const results = await prisma.$queryRaw`
      SELECT r.*, a.app_name 
      FROM fdas_result r
      LEFT JOIN fdas_application a ON r.app_id = a.id
      WHERE r.app_id IN (${appIds.join(',')})
      AND r.task_date >= ${start_date}
      AND r.task_date <= ${end_date}
      AND r.is_delete = 0
      ORDER BY r.task_date ASC
    `;

    // 按日期分组处理数据
    const groupedData = {};
    results.forEach(result => {
      const date = new Date(result.task_date).toISOString().split('T')[0];
      if (!groupedData[date]) {
        groupedData[date] = [];
      }

      const resultJson = result.result_json ? unzipJson(result.result_json) : null;
      if (resultJson) {
        groupedData[date].push({
          app_id: Number(result.app_id),
          app_name: result.app_name,
          value: JSON.parse(resultJson)
        });
      }
    });

    return {
      qualityInfo: groupedData
    };
  }

  // 同步分析任务结果
  async sync(data) {
    const { task_id, task_date, app_results } = data;

    // 插入应用分析结果
    app_results.forEach(async (appResult) => {
      const { app_id, cost_time, app_log, commit_id, result_json } = appResult;

      const app = await prisma.application.findFirst({
        where: {
          id: app_id,
        }
      });
      if (!app) return;

      await prisma.result.create({
        data: {
          taskId: task_id,
          taskDate: task_date,
          appId: app_id,
          costTime: cost_time,
          resultJson: result_json,
          resultLog: app_log,
          commitId: commit_id,
          isDelete: 0
        }
      });
    });
  }
}

module.exports = new ResultModel(); 