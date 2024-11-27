const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

// 拉取代码仓库
const cloneRepos = async function(repos) {
    for (const repoUrl of repos) {
      const repoName = path.basename(repoUrl, '.git');
      const targetDir = path.join(__dirname, '../codes/'+repoName);
      logger.info(`Cloning repository ${repoUrl}`);
      await this.cloneRepo(repoName, repoUrl, targetDir);
    }
}

const cloneRepo = async function(repoName, repoUrl, targetDir) {
    try {
      await execPromise(`git clone ${repoUrl} ${targetDir}`);
      logger.info(`Successfully cloned repository ${repoUrl}`);
    } catch (error) {
      logger.error(`Error cloning repository ${repoUrl}: ${error.message}`);
    }
}