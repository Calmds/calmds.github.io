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
        const platformsGrid = document.querySelector('.platforms-grid');
        if (!platformsGrid || !this.currentVersion) return;

        platformsGrid.innerHTML = '';

        const platforms = this.versionsData.platforms;
        const downloads = this.currentVersion.downloads;

        Object.keys(platforms).forEach(platformKey => {
            const platform = platforms[platformKey];
            const downloadInfo = downloads[platformKey];

            if (!downloadInfo) return;

            const platformCard = this.createPlatformCard(platform, downloadInfo);
            platformsGrid.appendChild(platformCard);
        });
    }

    createPlatformCard(platform, downloadInfo) {
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
                        <span class="badge latest">最新版本</span>
                    </div>
                </div>
            </div>
            
            <div class="platform-details">
                <div class="detail-item">
                    <span class="detail-label">文件大小</span>
                    <span class="detail-value">${downloadInfo.size}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">支持架构</span>
                    <span class="detail-value">${downloadInfo.arch.join(', ')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">系统要求</span>
                    <span class="detail-value">${downloadInfo.requirements}</span>
                </div>
            </div>
            
            <div class="platform-actions">
                <button class="glass-btn primary download-btn" 
                        data-platform="${platform.display_name.toLowerCase()}"
                        data-filename="${downloadInfo.filename}">
                    <i class="fas fa-download"></i>
                    <span>下载 ${this.currentVersion.version}</span>
                </button>
                <button class="glass-btn secondary info-btn">
                    <i class="fas fa-info-circle"></i>
                    <span>详情</span>
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
                const platform = btn.dataset.platform;
                const filename = btn.dataset.filename;

                await this.handleDownload(platform, filename);
            }
        });

        // FAQ折叠
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            if (question && answer) {
                question.addEventListener('click', () => {
                    const isOpen = answer.style.maxHeight;

                    // 关闭所有其他FAQ
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            const otherIcon = otherItem.querySelector('.faq-question i');

                            if (otherAnswer) {
                                otherAnswer.style.maxHeight = null;
                                otherAnswer.classList.remove('open');
                            }
                            if (otherIcon) {
                                otherIcon.style.transform = 'rotate(0deg)';
                            }
                        }
                    });

                    // 切换当前FAQ
                    if (isOpen) {
                        answer.style.maxHeight = null;
                        answer.classList.remove('open');
                        question.querySelector('i').style.transform = 'rotate(0deg)';
                    } else {
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                        answer.classList.add('open');
                        question.querySelector('i').style.transform = 'rotate(180deg)';
                    }
                });
            }
        });
    }

    async handleDownload(platform, filename) {
        try {
            // GitHub Pages的下载路径
            const downloadUrl = `assets/bin/${filename}`;

            // 创建临时链接进行下载
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 显示下载成功提示
            if (window.common) {
                window.common.showToast('开始下载，请稍候...', 'success');
            }

            // 记录下载统计（可以集成Google Analytics或自定义统计）
            this.trackDownload(platform, filename);

        } catch (error) {
            console.error('Download error:', error);
            if (window.common) {
                window.common.showToast('下载失败，请稍后重试', 'error');
            }
        }
    }

    trackDownload(platform, filename) {
        // 这里可以集成统计代码
        console.log(`Download tracked: ${platform} - ${filename}`);

        // 示例：发送到Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download', {
                'event_category': platform,
                'event_label': filename,
                'value': 1
            });
        }
    }

    showError() {
        const platformsGrid = document.querySelector('.platforms-grid');
        if (platformsGrid) {
            platformsGrid.innerHTML = `
                <div class="error-message glass-card">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>加载失败</h3>
                    <p>无法加载下载信息，请刷新页面重试。</p>
                    <button class="glass-btn primary" onclick="location.reload()">
                        刷新页面
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