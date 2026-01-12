// 下载页面功能
class DownloadManager {
    constructor() {
        this.versionsData = null;
        this.currentVersion = null;
        this.init();
    }

    async init() {
        try {
            await this.loadVersionsData();
            this.renderPlatforms();
            this.updateVersionInfo();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize download manager:', error);
            this.showError();
        }
    }

    async loadVersionsData() {
        try {
            const response = await fetch('data/versions.json');
            if (!response.ok) throw new Error('Failed to load versions data');

            this.versionsData = await response.json();
            this.currentVersion = this.versionsData.versions.find(v => v.latest);
        } catch (error) {
            console.error('Error loading versions:', error);
            throw error;
        }
    }

    renderPlatforms() {
        const platformsGrid = document.getElementById('platformsGrid');
        if (!platformsGrid || !this.currentVersion) return;

        // 清空加载占位符
        platformsGrid.innerHTML = '';

        const platforms = this.versionsData.platforms;
        const downloads = this.currentVersion.downloads;

        Object.keys(platforms).forEach(platformKey => {
            const platform = platforms[platformKey];
            const downloadInfos = downloads[platformKey];

            if (!downloadInfos) return;

            downloadInfos.forEach(downloadInfo => {
                const platformCard = this.createPlatformCard(platform, downloadInfo, this.currentVersion);
                platformsGrid.appendChild(platformCard);
            });
        });
    }

    createPlatformCard(platform, downloadInfo, currentVersion) {
        const card = document.createElement('div');
        card.className = 'platform-card glass-card';

        card.innerHTML = `
            <div class="platform-header">
                <div class="platform-icon">
                    <i class="${platform.icon}"></i>
                </div>
                <div class="platform-info">
                    <h3>${platform.display_name}</h3>
                    <div class="platform-badges">
                        <span class="badge latest" data-i18n="download.latest_version">最新版本</span>
                    </div>
                </div>
            </div>
            
            <div class="platform-details">
                <div class="detail-item">
                    <span class="detail-label" data-i18n="download.file_size">文件大小</span>
                    <span class="detail-value">${downloadInfo.size}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label" data-i18n="download.architecture">支持架构</span>
                    <span class="detail-value">${downloadInfo.architecture}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label" data-i18n="download.requirements">系统要求</span>
                    <span class="detail-value">${downloadInfo.requirements}</span>
                </div>
            </div>
            
            <div class="platform-actions">
                <button class="glass-btn primary download-btn" 
                        data-version="${currentVersion.version}"
                        data-platform="${platform.display_name.toLowerCase()}"
                        data-filename="${downloadInfo.filename}">
                    <i class="fas fa-download"></i>
                    <span data-i18n="download.download_now">立即下载</span>
                </button>
            </div>
        `;

        return card;
    }

    updateVersionInfo() {
        if (!this.currentVersion) return;

        // 更新版本号显示
        const versionElements = document.querySelectorAll('#currentVersion, .version');
        versionElements.forEach(el => {
            if (el.id === 'currentVersion' || el.classList.contains('version')) {
                el.textContent = this.currentVersion.version;
            }
        });

        // 更新发布日期
        const dateElements = document.querySelectorAll('#releaseDate, .release-date');
        dateElements.forEach(el => {
            if (el.id === 'releaseDate' || el.classList.contains('release-date')) {
                el.textContent = this.currentVersion.release_date;
            }
        });
    }

    setupEventListeners() {
        // 下载按钮事件
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.download-btn')) {
                const btn = e.target.closest('.download-btn');
                const version = btn.dataset.version;
                const filename = btn.dataset.filename;

                await this.handleDownload(version, filename);
            }
        });
    }

    async handleDownload(version, filename) {
        try {
            // 创建临时链接进行下载
            const link = document.createElement('a');
            // link.href = `https://github.com/Calmds/calmds.github.io/releases/tag/${version}/${filename}`;
            link.href = `https://github.com/Calmds/calmds.github.io/releases/download/${version}/${filename}`;
            link.download = filename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 显示下载成功提示
            if (window.common) {
                window.common.showToast('开始下载，请稍候...', 'success');
            }

        } catch (error) {
            console.error('Download error:', error);
            if (window.common) {
                window.common.showToast('下载失败，请稍后重试', 'error');
            }
        }
    }

    showError() {
        const platformsGrid = document.getElementById('platformsGrid');
        if (platformsGrid) {
            platformsGrid.innerHTML = `
                <div class="error-message glass-card">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3 data-i18n="download.error_title">加载失败</h3>
                    <p data-i18n="download.error_desc">无法加载下载信息，请刷新页面重试。</p>
                    <button class="glass-btn primary" onclick="location.reload()">
                        <span data-i18n="download.refresh_btn">刷新页面</span>
                    </button>
                </div>
            `;
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.downloadManager = new DownloadManager();
});