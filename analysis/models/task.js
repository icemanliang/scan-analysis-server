const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const uuid = require('uuid');

class TaskModel {
  async create(data) {
    return await prisma.task.create({
      data: {
        taskCode: uuid.v4(),
        appIds: Array.isArray(data.appIds) ? data.appIds.join(',') : data.appIds,
        pluginIds: Array.isArray(data.pluginIds) ? data.pluginIds.join(',') : data.pluginIds,
        taskStatus: 0,
        taskLog: '',
        taskDate: new Date(),
        costTime: 0,
        isDelete: 0
      }
    });
  }

  async list(query) {
    const { page_num = 1, page_size = 20 } = query;
    const where = {
      isDelete: 0 
    };

    const [total, tasks] = await prisma.$transaction([
      prisma.task.count(),
      prisma.task.findMany({
        where,
        skip: (page_num - 1) * page_size,
        take: page_size
      })
    ]);

    const [applications, plugins] = await Promise.all([
      prisma.application.findMany({
        select: {
          id: true,
          appName: true
        }
      }),
      prisma.plugin.findMany({
        select: {
          id: true,
          pluginName: true
        }
      })
    ]);

    const formattedData = tasks.map(item => ({
      id: Number(item.id),
      task_code: item.taskCode,
      apps: item.appIds?.split(',').map(id => {
        const app = applications.find(a => a.id === Number(id));
        return {
          name: app?.appName || '',
          value: Number(id)
        };
      }) || [],
      plugins: item.pluginIds?.split(',').map(id => {
        const plugin = plugins.find(p => p.id === Number(id));
        return {
          name: plugin?.pluginName || '',
          value: Number(id)
        };
      }) || [],
      task_status: item.taskStatus,
      task_log: item.taskLog || '',
      task_date: item.taskDate,
      cost_time: item.costTime || 0
    }));

    return {
      data: formattedData,
      count: total,
    };
  }

  async update(id, data) {
    return await prisma.task.update({
      where: { id: id },
      data: {
        ...data
      }
    });
  }

  async remove(id) {
    return await prisma.task.update({
      where: { id: id },
      data: {
        isDelete: 1
      }
    });
  }

  async getById(id) {
    const task = await prisma.task.findUnique({
      where: { id: id }
    });

    if (!task) return null;

    const [applications, plugins] = await Promise.all([
      prisma.application.findMany({
        select: {
          id: true,
          appName: true,
          appRepo: true,
          appBranch: true,
          appConfig: true
        }
      }),
      prisma.plugin.findMany({
        select: {
          id: true,
          pluginName: true,
          pluginConfig: true
        }
      })
    ]);

    return {
      id: Number(task.id),
      task_status: task.taskStatus,
      task_code: task.taskCode,
      task_date: task.taskDate,
      apps: task.appIds?.split(',').map(id => {
        const app = applications.find(a => a.id === Number(id));
        return {
          id: Number(id),
          name: app?.appName || '',
          repo: app?.appRepo || '',
          branch: app?.appBranch || '',
          config: app?.appConfig || ''
        };
      }) || [],
      plugins: task.pluginIds?.split(',').map(id => {
        const plugin = plugins.find(p => p.id === Number(id));
        return {
          id: Number(id),
          name: plugin?.pluginName || '',
          config: plugin?.pluginConfig || ''
        };
      }) || []
    };
  }
}

module.exports = new TaskModel(); 