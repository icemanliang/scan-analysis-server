const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PluginModel {
  async create(data) {
    return await prisma.plugin.create({
      data: {
        ...data
      }
    });
  }

  async list(query) {
    const { page_num = 1, page_size = 20 } = query;
    const where = {
      isDelete: 0
    };

    const [total, data] = await prisma.$transaction([
      prisma.plugin.count({ where }),
      prisma.plugin.findMany({
        where,
        skip: (page_num - 1) * page_size,
        take: page_size
      })
    ]);

    const formattedData = data.map(item => ({
      id: Number(item.id),
      plugin_status: item.pluginStatus,
      plugin_name: item.pluginName,
      plugin_desc: item.pluginDesc,
      plugin_config: item.pluginConfig
    }));

    return {
      data: formattedData,
      count: total,
    };
  }

  async update(id, data) {
    return await prisma.plugin.update({
      where: { id: id },
      data: {
        ...data
      }
    });
  }

  async remove(id) {
    return await prisma.plugin.update({
      where: { id: id },
      data: {
        isDelete: 1
      }
    });
  }
}

module.exports = new PluginModel(); 