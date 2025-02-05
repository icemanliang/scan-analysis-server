const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ApplicationModel {
  async create(data) {
    // 创建应用
    return await prisma.application.create({
      data: {
        name: data.appName,
        repo: data.appRepo,
        branch: data.appBranch,
        tags: data.appTags,
        description: data.appDesc,
        owner: data.appOwner,
        config: data.appConfig,
        status: data.appStatus,
        isDelete: 0
      }
    });
  }

  async list(query) {
    const { query: searchQuery, page_num = 1, page_size = 20 } = query;
    const where = {
      isDelete: 0
    };
    
    if (searchQuery?.app_name) {
      where.name = {
        contains: searchQuery.app_name
      };
    }

    const [total, data] = await prisma.$transaction([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        skip: (page_num - 1) * page_size,
        take: page_size
      })
    ]);

    const formattedData = data.map(item => ({
      id: Number(item.id),
      app_name: item.name,
      app_repo: item.repo,
      app_branch: item.branch,
      app_tags: item.tags?.split(',') || [],
      app_desc: item.description,
      app_owner: item.owner,
      app_config: item.config,
      app_status: Boolean(item.status)
    }));

    return {
      data: formattedData,
      count: total,
    };
  }

  async update(id, data) {
    return await prisma.application.update({
      where: { id: id },
      data: {
        ...data
      }
    });
  }

  async remove(id) {
    return await prisma.application.update({
      where: { id: id },
      data: {
        isDelete: 1
      }
    });
  }

  async findById(id) {
    return await prisma.application.findFirst({
      where: {
        id: id,
        isDelete: 0
      }
    });
  }
}

module.exports = new ApplicationModel(); 