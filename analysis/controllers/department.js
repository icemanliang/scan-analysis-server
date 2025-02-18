const DepartmentModel = require('../models/department');
const logger = require('../logger');

class DepartmentController {
  async add(ctx) {
    logger.info('add department.');
    const { dept_name, dept_code, dept_owner, apps } = ctx.request.body;
    
    const createData = {
      deptName: dept_name,
      deptCode: dept_code,
      deptOwner: dept_owner,
      appIds: apps.map(app => app.value).join(',')
    };

    await DepartmentModel.create(createData);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: null
    };
  }

  async list(ctx) {
    logger.info('list department.');
    const query = ctx.request.body;
    // console.log(query);
    const result = await DepartmentModel.list(query);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: result
    };
  }

  async update(ctx) {
    logger.info('update department.');
    const { id, dept_name, dept_code, apps, dept_owner } = ctx.request.body;
    
    const updateData = {
      deptName: dept_name,
      deptCode: dept_code,
      deptOwner: dept_owner,
      appIds: apps.map(app => app.value).join(',')
    };

    await DepartmentModel.update(id, updateData);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: null
    };
  }

  async remove(ctx) {
    logger.info('remove department.');
    const { id } = ctx.request.body;
    // console.log(id);
    await DepartmentModel.remove(id);
    
    ctx.body = {
      code: 0,
      msg: 'OK',
      data: null
    };
  }
}

module.exports = new DepartmentController(); 