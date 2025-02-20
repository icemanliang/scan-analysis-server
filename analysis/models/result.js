const { PrismaClient } = require('@prisma/client');
const { unzipJson } = require('../middlewares/gizp');
const prisma = new PrismaClient();

class ResultModel {
  // 获取单应用某批次分析结果
  async getAppResult(query) {
    const { app_id, task_id,keys } = query;
    
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
    const owner = await prisma.application.findFirst({
      where: {
        id: app_id
      },
      select: {
        appOwner: true
      } 
    });

    if (resultJson) {
      // 处理结果数据
      const formattedResult = {
        baseInfo: {
          commitId: results[0]?.commitId,
          owner: owner.appOwner
        }
      };
      // 根据请求的keys添加对应属性
      if(keys && keys.length>0) {
        keys.forEach(key => {
            formattedResult[key.name] = {};
            if(key.props && key.props.length>0) {
              key.props.forEach(prop => {
                formattedResult[key.name][prop] = resultJson[key.name]?.[prop] ?? null;
              });
            } else {
              formattedResult[key.name] = resultJson[key.name] || null;
            }
        });
      }
      // 返回结果
      return formattedResult;
    }

    return null;
  }

  // 获取单应用特定时间区间内分析结果趋势
  async getAppTrend(query) {
    const { app_id, start_date, end_date, keys } = query;

    const results = await prisma.result.findMany({
      where: {
        appId: app_id,
        taskDate: {
          gte: start_date,
          lte: end_date
        },
        isDelete: 0
      },
      select: {
        taskDate: true,
        resultJson: true
      },
      orderBy: {
        taskDate: 'asc'
      }
    });
    if (!results.length) return null;

    // 初始化返回结果结构
    const formattedResult = [];

    // 处理每个时间点的数据
    results.forEach(result => {
      const timestamp = new Date(result.taskDate).getTime().toString();
      const resultJson = result.resultJson ? JSON.parse(unzipJson(result.resultJson)) : null;

      if(resultJson) {
        const item = {};
        // 根据请求的keys添加对应属性
        if(keys && keys.length>0) {
          keys.forEach(key => {
            item[key.name] = {};
            if(key.props && key.props.length>0) {
              key.props.forEach(prop => {
                item[key.name][prop] = resultJson[key.name]?.[prop] ?? null;
              });
            } else {
              item[key.name] = resultJson[key.name] || null;
            }
          });
        }
        formattedResult.push({
          date: timestamp,
          info: item
        });
      }
    });

    return formattedResult;
  }

  // 获取部门多应用单批次分析结果
  async getDeptResult(query) {
    const { dept_ids, task_id, keys } = query;

    // 获取部门ID
    const departments = await prisma.department.findMany({
      where: {
        id: {
          in: dept_ids
        },
        isDelete: 0
      }
    });

    // 获取部门下应用信息
    const apps = await Promise.all(
      departments
        .map(dept => dept.appIds?.split(',').map(Number) || [])
        .flat()
        .filter(id => id && !isNaN(id)) // 过滤无效ID
        .map(async (id) => {
          const app = await prisma.application.findFirst({
            where: {
              id: id,
              isDelete: 0  // 确保只查询未删除的应用
            },
            select: {
              appName: true
            }
          });
          return {
            appId: id,
            appName: app?.appName  // 添加可选链，防止 app 为 null
          };
        })
    );
    // console.log(apps);

    // 获取部门下应用的分析结果
    const results = await prisma.result.findMany({
      where: {
        appId: {
          in: apps.map(app => app.appId)
        },
        taskId: task_id,
        isDelete: 0
      },
      select: {
        appId: true,
        resultJson: true
      }
    })

    if (!results.length) return null;

    const formattedResult = [];
    results.forEach(result => {
      const resultJson = result.resultJson ? JSON.parse(unzipJson(result.resultJson)) : null;

      if(resultJson) {
        const item = {};
        // 根据请求的keys添加对应属性
        if(keys && keys.length>0) {
          keys.forEach(key => {
            item[key.name] = {};
            if(key.props && key.props.length>0) {
              key.props.forEach(prop => {
                item[key.name][prop] = resultJson[key.name]?.[prop] ?? null;
              });
            } else {
              item[key.name] = resultJson[key.name] || null;
            }
          });
        }
        formattedResult.push({
          appId: result.appId,
          appName: apps.find(app => app.appId === result.appId)?.appName,
          info: item
        });
      }
    });

    return formattedResult;
  }

  // 获取部门特定时间区间内分析结果趋势
  async getDeptTrend(query) {
    const { dept_ids, start_date, end_date, keys } = query;

    // 获取部门信息
    const departments = await prisma.department.findMany({
      where: {
        id: {
          in: dept_ids
        },
        isDelete: 0
      }
    });

    // 获取部门下应用信息
    const apps = await Promise.all(
      departments
        .map(dept => dept.appIds?.split(',').map(Number) || [])
        .flat()
        .filter(id => id && !isNaN(id)) // 过滤无效ID
        .map(async (id) => {
          const app = await prisma.application.findFirst({
            where: {
              id: id,
              isDelete: 0  // 确保只查询未删除的应用
            },
            select: {
              appName: true
            }
          });
          return {
            appId: id,
            appName: app?.appName  // 添加可选链，防止 app 为 null
          };
        })
    );
    // console.log(apps);

    // 查询结果
    const results = await prisma.result.findMany({
      where: {
        appId: {
          in: apps.map(app => app.appId)
        },
        taskDate: {
          gte: start_date,
          lte: end_date
        },
        isDelete: 0
      },
      select: {
        appId: true,
        taskDate: true,
        resultJson: true
      },
      orderBy: {
        taskDate: 'asc'
      }
    });

    if (!results.length) return null;

    // 按日期分组处理数据
    const groupedData = {};
    results.forEach(result => {
      const date = new Date(result.taskDate).getTime().toString();
      if (!groupedData[date]) {
        groupedData[date] = [];
      }

      const resultJson = result.resultJson ? JSON.parse(unzipJson(result.resultJson)) : null;
      if (resultJson) {
        const item = {};
        // 根据请求的keys添加对应属性
        if(keys && keys.length>0) {
          keys.forEach(key => {
            item[key.name] = {};
            if(key.props && key.props.length>0) {
              key.props.forEach(prop => {
                item[key.name][prop] = resultJson[key.name]?.[prop] ?? null;
              });
            } else {
              item[key.name] = resultJson[key.name] || null;
            }
          });
        }
        groupedData[date].push({
          appId: result.appId,
          appName: apps.find(app => app.appId === result.appId)?.appName,
          info: item
        });
      }
    });

    return groupedData;
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