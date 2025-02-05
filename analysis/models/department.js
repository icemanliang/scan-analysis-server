const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DepartmentModel {
  async create(data) {
    // 创建部门
    return await prisma.department.create({
      data: {
        ...data,
      }
    });
  }

  async list(query) {
    const { page_num = 1, page_size = 20 } = query;
    const where = {
      isDelete: 0
    };

    const [total, departments] = await prisma.$transaction([
      prisma.department.count({ where }),
      prisma.department.findMany({
        where,
        skip: (page_num - 1) * page_size,
        take: page_size
      })
    ]);

    const formattedData = await Promise.all(departments.map(async item => {
      const appIds = item.appIds ? item.appIds.split(',').map(Number) : [];
      const apps = await prisma.application.findMany({
        where: {
          id: {
            in: appIds
          },
          isDelete: 0
        },
        select: {
          id: true,
          appName: true
        }
      });

      return {
        id: Number(item.id),
        dept_name: item.deptName,
        dept_code: item.deptCode,
        apps: apps.map(app => ({
          name: app.appName,
          value: Number(app.id)
        }))
      };
    }));

    return {
      data: formattedData,
      count: total,
    };
  }

  async update(id, data) {
    return await prisma.department.update({
      where: { id: id },
      data: {
        ...data
      }
    });
  }

  async remove(id) {
    return await prisma.department.update({
      where: { id: id },
      data: {
        isDelete: 1
      }
    });
  }
}

module.exports = new DepartmentModel(); 