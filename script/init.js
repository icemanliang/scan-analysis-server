const { PrismaClient } = require('@prisma/client')
const { readFileSync } = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function executeSqlFile(filePath) {
  try {
    // 读取SQL文件
    const sql = readFileSync(path.resolve(__dirname, filePath), 'utf-8')
    
    // 分割SQL语句（假设每条语句以分号结尾）
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0)

    // 执行每条SQL语句
    for (const statement of statements) {
      try {
        // 使用Prisma执行原生SQL
        await prisma.$executeRawUnsafe(statement)
        console.log('成功执行SQL语句')
      } catch (error) {
        console.error('执行SQL语句失败:', error)
      }
    }
    
    console.log('SQL文件执行完成')
  } catch (error) {
    console.error('读取或执行SQL文件失败:', error)
  }
}

async function main() {
  try {
    // 清理现有数据
    await prisma.result.deleteMany()
    await prisma.task.deleteMany()
    await prisma.application.deleteMany()
    await prisma.department.deleteMany()
    await prisma.plugin.deleteMany()

    // 执行SQL文件
    await executeSqlFile('./data.sql')
    
    console.log('数据迁移完成')
  } catch (error) {
    console.error('迁移过程出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()