const sqlite3 = require('sqlite3');
const path = require('path');

// 创建数据库文件
const dbPath = path.resolve(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
  }
});

// 创建数据表
const createTables = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS plugins (
        plugin_id INTEGER PRIMARY KEY AUTOINCREMENT,
        plugin_name TEXT NOT NULL,
        plugin_config TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS applications (
        app_id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_name TEXT NOT NULL,
        repo_url TEXT NOT NULL,
        scan_config TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        task_id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_date TEXT NOT NULL,
        task_status INTEGER NOT NULL,
        task_result TEXT NOT NULL,
        application_list TEXT NOT NULL,
        plugin_list TEXT NOT NULL
      )
    `);
    console.log('Tables created successfully');
  });

  // 关闭数据库连接
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Closed the database connection.');
  });
};

createTables();
