const Joi = require('joi');

// 通用验证中间件
const validate = (schema) => async (ctx, next) => {
  try {
    ctx.request.body = await schema.validateAsync(ctx.request.body);
    await next();
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      msg: err.message
    };
  }
};

// 应用相关验证规则
const applicationSchema = {
  add: Joi.object({
    app_name: Joi.string().required(),
    app_repo: Joi.string().required(),
    app_branch: Joi.string().required(),
    app_tags: Joi.array().items(Joi.string()),
    app_desc: Joi.string().allow(''),
    app_owner: Joi.string().required(),
    app_config: Joi.string().allow(''),
    app_status: Joi.boolean().default(true)
  }),
  
  update: Joi.object({
    id: Joi.number().required(),
    app_name: Joi.string(),
    app_repo: Joi.string(),
    app_branch: Joi.string(),
    app_tags: Joi.array().items(Joi.string()),
    app_desc: Joi.string().allow(''),
    app_owner: Joi.string(),
    app_config: Joi.string().allow(''),
    app_status: Joi.boolean(),
  }),

  remove: Joi.object({
    id: Joi.number().required()
  }),

  list: Joi.object({
    query: Joi.object({
      app_name: Joi.string().allow('')
    }),
    page_num: Joi.number().default(1),
    page_size: Joi.number().default(20)
  })
};

// 部门相关验证规则
const departmentSchema = {
  add: Joi.object({
    dept_name: Joi.string().required(),
    dept_code: Joi.string().required(),
    apps: Joi.array().items(Joi.object({
      value: Joi.number().required()
    }))
  }),
  
  update: Joi.object({
    id: Joi.number().required(),
    dept_name: Joi.string(),
    dept_code: Joi.string(),
    apps: Joi.array().items(Joi.object({
      value: Joi.number().required()
    }))
  }),

  remove: Joi.object({
    id: Joi.number().required()
  }),

  list: Joi.object({
    page_num: Joi.number().default(1),
    page_size: Joi.number().default(20)
  })
};

// 插件相关验证规则
const pluginSchema = {
  add: Joi.object({
    plugin_name: Joi.string().required(),
    plugin_desc: Joi.string(),
    plugin_config: Joi.string().required(),
    plugin_status: Joi.number().default(1)
  }),
  
  update: Joi.object({
    id: Joi.number().required(),
    plugin_status: Joi.number(),
    plugin_name: Joi.string(),
    plugin_desc: Joi.string(),
    plugin_config: Joi.string()
  }),

  remove: Joi.object({
    id: Joi.number().required()
  }),

  list: Joi.object({
    page_num: Joi.number().default(1),
    page_size: Joi.number().default(20)
  })
};

// 任务相关验证规则 
const taskSchema = {
  add: Joi.object({
    app_ids: Joi.array().items(Joi.number()).required(),
    plugin_ids: Joi.array().items(Joi.number()).required(),
  }),

  list: Joi.object({
    page_num: Joi.number().default(1),
    page_size: Joi.number().default(20)
  }),

  remove: Joi.object({
    id: Joi.number().required()
  }),

  getById: Joi.object({
    id: Joi.number().required(),
  }),

  discard: Joi.object({
    id: Joi.number().required()
  })
};

// 结果相关验证规则
const resultSchema = {
  app: Joi.object({
    app_id: Joi.number().required(),
    task_id: Joi.number().required(),
    keys: Joi.array().items(Joi.string())
  }),

  appPropsTrend: Joi.object({
    app_id: Joi.number().required(),
    start_date: Joi.string().required(),
    end_date: Joi.string().required(),
    keys: Joi.array().items(Joi.string()),
    props: Joi.array().items(Joi.string())
  }),

  deptPropsTrend: Joi.object({
    dept_ids: Joi.array().items(Joi.number()).required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    props: Joi.array().items(Joi.string()),
    keys: Joi.array().items(Joi.string())
  }),

  sync: Joi.object({
    task_id: Joi.number().required(),
    task_code: Joi.string().required(),
    cost_time: Joi.number().required(),
    task_log: Joi.string().required(),
    app_results: Joi.array().items(Joi.object({
      app_id: Joi.number().required(),
      cost_time: Joi.number().required(),
      app_log: Joi.string().required(),
      commit_id: Joi.string().required(),
      result_json: Joi.string().required()
    })).required()
  })
};

// 验证器对象
const validator = {
  application: {
    add: validate(applicationSchema.add),
    list: validate(applicationSchema.list),
    remove: validate(applicationSchema.remove),
    update: validate(applicationSchema.update)
  },

  department: {
    add: validate(departmentSchema.add),
    list: validate(departmentSchema.list),
    remove: validate(departmentSchema.remove),
    update: validate(departmentSchema.update)
  },

  plugin: {
    add: validate(pluginSchema.add),
    list: validate(pluginSchema.list),
    remove: validate(pluginSchema.remove),
    update: validate(pluginSchema.update)
  },

  task: {
    add: validate(taskSchema.add),
    list: validate(taskSchema.list),
    remove: validate(taskSchema.remove),
    getById: validate(taskSchema.getById),
    discard: validate(taskSchema.discard)
  },

  result: {
    app: validate(resultSchema.app),
    appPropsTrend: validate(resultSchema.appPropsTrend),
    deptPropsTrend: validate(resultSchema.deptPropsTrend),
    sync: validate(resultSchema.sync)
  }
};

module.exports = validator; 