#!/usr/bin/env node

/**
 * 自动版本检查脚本
 * 
 * 功能:
 * - 调用 GitHub API 获取最新 Release
 * - 自动提取版本号、发布日期、更新日志
 * - 智能添加到 versions.json（如果不存在）
 * - 安全降级：API 失败不影响构建
 * - 集成到 GitHub Actions 构建流程
 * 
 * 使用方法:
 *   node scripts/update-versions.js
 * 
 * 环境变量:
 *   GITHUB_TOKEN - GitHub Personal Access Token (可选，用于提高 API 限流)
 *   GITHUB_REPO - GitHub 仓库路径 (默认从当前 git remote 获取)
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    versionsFile: path.join(__dirname, '..', 'data', 'versions.json'),
    githubAPI: 'https://api.github.com',
    timeout: 5000, // 5 秒超时
};

/**
 * 从 git remote 获取仓库信息
 */
function getRepoFromGit() {
    try {
        const { execSync } = require('child_process');
        const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
        
        // 解析 GitHub URL: https://github.com/owner/repo.git 或 git@github.com:owner/repo.git
        const match = remoteUrl.match(/github\.com[/:]([^/]+)\/([^.]+)/);
        if (match) {
            return `${match[1]}/${match[2]}`;
        }
    } catch (error) {
        console.warn('无法从 git 获取仓库信息:', error.message);
    }
    return null;
}

/**
 * 获取 GitHub 仓库信息
 */
function getGitHubRepo() {
    // 优先使用环境变量
    if (process.env.GITHUB_REPO) {
        return process.env.GITHUB_REPO;
    }
    
    // 尝试从 git 获取
    const repo = getRepoFromGit();
    if (repo) {
        return repo;
    }
    
    // 默认值 (需要根据实际情况修改)
    console.warn('未指定 GITHUB_REPO，使用默认值');
    return 'your-username/news-assistant';
}

/**
 * 获取 GitHub Token
 */
function getGitHubToken() {
    return process.env.GITHUB_TOKEN || '';
}

/**
 * 调用 GitHub API 获取最新 Release
 */
async function fetchLatestRelease(repo) {
    const token = getGitHubToken();
    const url = `${CONFIG.githubAPI}/repos/${repo}/releases/latest`;
    
    const headers = {
        'User-Agent': 'News-Assistant-Version-Checker/1.0',
        'Accept': 'application/vnd.github.v3+json',
    };
    
    if (token) {
        headers['Authorization'] = `token ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            headers,
            timeout: CONFIG.timeout,
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log('没有找到 Release 信息');
                return null;
            }
            if (response.status === 403) {
                console.warn('GitHub API 限流，请稍后重试');
                return null;
            }
            throw new Error(`GitHub API 返回错误：${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.warn(`获取 GitHub Release 失败：${error.message}`);
        return null;
    }
}

/**
 * 解析 Release 数据
 */
function parseReleaseData(release) {
    if (!release) return null;
    
    return {
        version: release.tag_name.replace(/^v/, ''), // 移除 v 前缀
        release_date: new Date(release.published_at).toISOString().split('T')[0],
        latest: true,
        changelog: parseChangelog(release.body),
        prerelease: release.prerelease || false,
        draft: release.draft || false,
        html_url: release.html_url,
        tarball_url: release.tarball_url,
        zipball_url: release.zipball_url,
    };
}

/**
 * 解析更新日志
 */
function parseChangelog(body) {
    if (!body) return ['暂无更新说明'];
    
    // 将 Markdown 转换为简单的文本行
    const lines = body.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.replace(/^[-*]\s*/, '')); // 移除列表符号
    
    return lines.length > 0 ? lines : ['暂无更新说明'];
}

/**
 * 读取现有 versions.json
 */
function readVersionsFile() {
    try {
        if (!fs.existsSync(CONFIG.versionsFile)) {
            console.log('versions.json 不存在，将创建新文件');
            return { versions: [], platforms: {} };
        }
        
        const content = fs.readFileSync(CONFIG.versionsFile, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`读取 versions.json 失败：${error.message}`);
        return { versions: [], platforms: {} };
    }
}

/**
 * 写入 versions.json
 */
function writeVersionsFile(data) {
    try {
        // 确保目录存在
        const dir = path.dirname(CONFIG.versionsFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // 格式化输出
        const content = JSON.stringify(data, null, 4);
        fs.writeFileSync(CONFIG.versionsFile, content, 'utf8');
        console.log(`✓ 已更新 versions.json`);
    } catch (error) {
        console.error(`写入 versions.json 失败：${error.message}`);
    }
}

/**
 * 更新版本信息
 */
function updateVersions(versionsData, newVersion) {
    if (!newVersion) {
        console.log('没有新的版本信息');
        return versionsData;
    }
    
    // 检查是否已存在该版本
    const existingIndex = versionsData.versions.findIndex(
        v => v.version === newVersion.version
    );
    
    if (existingIndex !== -1) {
        console.log(`版本 ${newVersion.version} 已存在`);
        
        // 更新 latest 标志
        versionsData.versions.forEach((v, index) => {
            v.latest = (index === existingIndex);
        });
        
        return versionsData;
    }
    
    // 将所有现有版本的 latest 设为 false
    versionsData.versions.forEach(v => {
        v.latest = false;
    });
    
    // 添加新版本到开头
    versionsData.versions.unshift(newVersion);
    
    console.log(`✓ 添加新版本：${newVersion.version}`);
    return versionsData;
}

/**
 * 主函数
 */
async function main() {
    console.log('🔍 开始检查 GitHub Release...');
    
    const repo = getGitHubRepo();
    console.log(`📦 仓库：${repo}`);
    
    // 获取最新 Release
    const release = await fetchLatestRelease(repo);
    
    if (!release) {
        console.log('⚠️  无法获取 Release 信息，保持现有数据');
        return;
    }
    
    console.log(`📝 找到 Release: ${release.tag_name}`);
    
    // 解析数据
    const versionData = parseReleaseData(release);
    console.log(`📋 版本信息:`);
    console.log(`   版本号：${versionData.version}`);
    console.log(`   发布日期：${versionData.release_date}`);
    console.log(`   更新内容：${versionData.changelog.length} 条`);
    
    // 读取现有数据
    const versionsData = readVersionsFile();
    
    // 更新数据
    const updatedData = updateVersions(versionsData, versionData);
    
    // 写入文件
    writeVersionsFile(updatedData);
    
    console.log('✅ 版本检查完成');
}

// 运行主函数
main().catch(error => {
    console.error('❌ 发生错误:', error.message);
    // 不退出进程，允许构建继续
});
