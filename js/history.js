// 历史版本页面功能
class HistoryManager {
    constructor() {
        this.versionsData = null;
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.init();
    }

    async init() {
        try {
            await this.loadVersionsData();
            this.renderVersions();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize history manager:', error);
            this.showError();
        }
    }

    async loadVersionsData() {
        try {
            const response = await fetch('data/versions.json');
            if (!response.ok) throw new Error('Failed to load versions data');

            this.versionsData = await response.json();
        } catch (error) {
            console.error('Error loading versions:', error);
            throw error;
        }
    }

    renderVersions() {
        const versionsList = document.getElementById('versionsList');
        if (!versionsList || !this.versionsData) return;

        // 移除加载占位符
        const loadingPlaceholder = versionsList.querySelector('.loading-placeholder');
        if (loadingPlaceholder) {
            loadingPlaceholder.remove();
        }

        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const versionsToShow = this.versionsData.versions.slice(startIndex, endIndex);

        if (versionsToShow.length === 0) {
            this.showEmptyState();
            return;
        }

        versionsToShow.forEach((version, index) => {
            const versionElement = this.createVersionElement(version, index);
            versionsList.appendChild(versionElement);
        });

        this.updateLoadMoreButton();
    }

    createVersionElement(version, index) {
        const element = document.createElement('div');
        element.className = 'version-item glass-card';
        element.dataset.version = version.version;

        element.innerHTML = `
            <div class="version-header">
                <div class="version-bullet ${version.latest ? 'latest' : ''}"></div>
                <div class="version-info">
                    <div class="version-title">
                        <h3>${version.version}</h3>
                        ${version.latest ? '<span class="version-badge latest" data-i18n="history.latest">最新版本</span>' : ''}
                    </div>
                    <div class="version-date">${version.release_date}</div>
                </div>
                <button class="version-toggle">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            
            <div class="version-content">
                <div class="changelog-section">
                    <h4 data-i18n="history.changelog">更新日志</h4>
                    <ul class="changelog-list">
                        ${version.changelog.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="downloads-section">
                    <h4 data-i18n="history.downloads">下载链接</h4>
                    <div class="downloads-grid">
                        ${this.createDownloadLinks(version)}
                    </div>
                </div>
            </div>
        `;

        return element;
    }

    createDownloadLinks(version) {
        const platforms = this.versionsData.platforms;
        const downloads = version.downloads;

        let linksHtml = '';

        Object.keys(platforms).forEach(platformKey => {
            const platform = platforms[platformKey];
            const downloadInfo = downloads[platformKey];

            if (!downloadInfo) return;

            linksHtml += `
                <div class="download-platform">
                    <div class="platform-icon-small">
                        <i class="${platform.icon}"></i>
                    </div>
                    <div class="platform-info-small">
                        <h5>${platform.display_name}</h5>
                        <p>${downloadInfo.size}</p>
                    </div>
                    <a href="assets/bin/${downloadInfo.filename}" 
                       class="download-link"
                       download="${downloadInfo.filename}"
                       data-i18n="history.download_link">
                        <span>下载</span>
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            `;
        });

        return linksHtml;
    }

    setupEventListeners() {
        // 版本折叠/展开
        document.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('.version-toggle');
            if (toggleBtn) {
                const versionItem = toggleBtn.closest('.version-item');
                const content = versionItem.querySelector('.version-content');
                const icon = toggleBtn.querySelector('i');

                const isOpen = content.style.maxHeight;

                // 关闭所有其他版本
                document.querySelectorAll('.version-content').forEach(otherContent => {
                    if (otherContent !== content && otherContent.style.maxHeight) {
                        otherContent.style.maxHeight = null;
                        otherContent.closest('.version-item')
                            .querySelector('.version-toggle i')
                            .style.transform = 'rotate(0deg)';
                    }
                });

                // 切换当前版本
                if (isOpen) {
                    content.style.maxHeight = null;
                    icon.style.transform = 'rotate(0deg)';
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    icon.style.transform = 'rotate(180deg)';
                }
            }
        });

        // 下载链接点击统计
        document.addEventListener('click', (e) => {
            const downloadLink = e.target.closest('.download-link');
            if (downloadLink) {
                const filename = downloadLink.getAttribute('download');
                const platform = downloadLink.closest('.download-platform')
                    .querySelector('h5').textContent;

                this.trackDownload(platform, filename);
            }
        });

        // 加载更多
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMore());
        }
    }

    loadMore() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;

        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> 加载中...</span>';

        setTimeout(() => {
            this.currentPage++;
            this.renderVersions();

            loadMoreBtn.disabled = false;
            loadMoreBtn.innerHTML = '<span data-i18n="history.load_more">加载更多</span>';
        }, 500);
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;

        const totalItems = this.versionsData?.versions?.length || 0;
        const loadedItems = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        if (loadedItems >= totalItems) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
    }

    trackDownload(platform, filename) {
        console.log(`Download tracked: ${platform} - ${filename}`);

        if (typeof gtag !== 'undefined') {
            gtag('event', 'download', {
                'event_category': 'history_page',
                'event_label': `${platform}_${filename}`,
                'value': 1
            });
        }
    }

    showError() {
        const versionsList = document.getElementById('versionsList');
        if (versionsList) {
            versionsList.innerHTML = `
                <div class="error-message glass-card">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3 data-i18n="history.error_title">加载失败</h3>
                    <p data-i18n="history.error_desc">无法加载版本信息，请刷新页面重试。</p>
                    <button class="glass-btn primary" onclick="location.reload()">
                        <span data-i18n="history.refresh_btn">刷新页面</span>
                    </button>
                </div>
            `;
        }
    }

    showEmptyState() {
        const versionsList = document.getElementById('versionsList');
        if (versionsList) {
            versionsList.innerHTML = `
                <div class="empty-state glass-card">
                    <i class="fas fa-inbox"></i>
                    <h3 data-i18n="history.no_versions">暂无版本信息</h3>
                    <p data-i18n="history.no_versions_desc">当前没有可用的版本记录。</p>
                </div>
            `;
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.historyManager = new HistoryManager();
});