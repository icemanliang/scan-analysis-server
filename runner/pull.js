const { exec } = require('child_process');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * 代码仓库配置类型
 * @typedef {Object} RepoConfig
 * @property {string} repo - 远程仓库地址
 * @property {string} branch - 分支名
 * @property {string} localPath - 本地存放路径
 * @property {Object} [auth] - 认证信息
 * @property {string} auth.username - 用户名
 * @property {string} auth.password - 密码或访问令牌
 */

// 使用示例：
// const repoConfigs = [
//   {
//     repo: 'https://github.com/username/repo1.git',
//     branch: 'main',
//     localPath: '/path/to/local/directory'
//   },
//   {
//     repo: 'https://github.com/username/repo2.git',
//     branch: 'develop',
//     localPath: '/path/to/local/directory'
//   }
// ];
// 
// pullCode(repoConfigs).then(results => {
//   console.log('拉取结果:', results);
// }).catch(error => {
//   console.error('执行失败:', error);
// });

/**
 * 拉取代码并返回提交信息
 * @param {RepoConfig[]} repoConfigs - 仓库配置数组
 * @returns {Promise<Array<{repo: string, branch: string, commitId: string, status: string}>>}
 */
async function pullCode(repoConfigs) {
  const results = [];

  for (const config of repoConfigs) {
    const { repo, branch, localPath, auth } = config;
    const repoName = repo.split('/').pop().replace('.git', '');
    const fullPath = path.join(localPath, repoName);

    try {
      let commitId;
      
      // 配置 simple-git 实例
      const gitOptions = {
        baseDir: fullPath,
        binary: 'git',
        maxConcurrentProcesses: 1,
        timeout: {
          block: 10000  // 设置命令超时时间为 10 秒
        }
      };
      
      // 如果提供了认证信息，添加到仓库URL中
      const repoUrl = auth 
        ? repo.replace('https://', `https://${auth.username}:${auth.password}@`)
        : repo;

      if (fs.existsSync(fullPath)) {
        // 目录存在，执行 git pull
        console.log(`正在更新仓库: ${repoName}`);
        const git = simpleGit(gitOptions);
        await git
          .checkout(branch)
          .pull('origin', branch);
      } else {
        // 目录不存在，执行 git clone
        console.log(`正在克隆仓库: ${repoName}`);
        await simpleGit()
          .clone(repoUrl, fullPath, [
            '--branch', 
            branch,
          ]);
      }

      // 获取当前 commit ID
      const git = simpleGit(gitOptions);
      const commitIdResult = await git.revparse(['HEAD']);
      commitId = commitIdResult.trim();

      results.push({
        repo: repoName,
        branch,
        commitId: commitId.slice(0, 7),
        status: 'success'
      });

    } catch (error) {
      console.error(`处理仓库 ${repoName} 时发生错误:`, error);
      results.push({
        repo: repoName,
        branch,
        commitId: null,
        status: 'error',
        error: error.message
      });
    }
  }

  return results;
}

module.exports = {
  pullCode
};
