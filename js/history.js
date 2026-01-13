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

        // 如果是第一页，清空列表
        if (this.currentPage === 1) {
            const loadingPlaceholder = versionsList.querySelector('.loading-placeholder');
            if (loadingPlaceholder) {
                loadingPlaceholder.remove();
            }
            versionsList.innerHTML = '';
        }

        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const versionsToShow = this.versionsData.versions.slice(startIndex, endIndex);

        if (versionsToShow.length === 0 && this.currentPage === 1) {
            this.showEmptyState();
            return;
        }

        versionsToShow.forEach((version, index) => {
            const versionElement = this.createVersionElement(version);
            versionsList.appendChild(versionElement);
        });

        this.updateLoadMoreButton();
        this.setupVersionToggle(); // 重新绑定事件
    }

    createVersionElement(version) {
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
                <button class="version-toggle" aria-label="展开/收起版本详情">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            
            <div class="version-content">
                <div class="changelog-section">
                    <h4><i class="fas fa-list-check"></i> <span data-i18n="history.changelog">更新日志</span></h4>
                    <ul class="changelog-list">
                        ${version.changelog.map(item => `<li>${this.escapeHtml(item)}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="downloads-section">
                    <h4><i class="fas fa-download"></i> <span data-i18n="history.downloads">下载链接</span></h4>
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
            const downloadInfos = downloads[platformKey];
            console.log('HistoryManager: createDownloadLinks: ', downloadInfos);

            if (!downloadInfos) return;
            // href="https://github.com/Calmds/calmds.github.io/releases/tag/${version.version}/${downloadInfo.filename}"
            downloadInfos.forEach(downloadInfo => {
                linksHtml += `
                <div class="download-platform">
                    <div class="platform-icon-small">
                        <i class="${platform.icon}"></i>
                    </div>
                    <div class="platform-info-small">
                        <h5>${platform.display_name}</h5>
                        <p>${downloadInfo.size || ''} ${downloadInfo.architecture ? `· ${downloadInfo.architecture}` : ''}</p>
                    </div>
                    <a href="https://github.com/Calmds/calmds.github.io/releases/download/${version.version}/${downloadInfo.filename}"
                       class="download-link"
                       ${downloadInfo.filename ? `download="${downloadInfo.filename}"` : ''}
                       target="_blank"
                       rel="noopener noreferrer">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            `;
            })
        });

        return linksHtml || '<p class="no-downloads" data-i18n="history.no_downloads">暂无下载链接</p>';
    }

    setupVersionToggle() {
        document.querySelectorAll('.version-header').forEach(header => {
            // 确保没有重复绑定
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);

            newHeader.addEventListener('click', (e) => {
                // 如果点击的是下载链接，不处理
                if (e.target.closest('.download-link')) {
                    return;
                }

                const versionItem = newHeader.closest('.version-item');
                const isActive = versionItem.classList.contains('active');

                // 关闭所有其他版本
                document.querySelectorAll('.version-item.active').forEach(item => {
                    if (item !== versionItem) {
                        item.classList.remove('active');
                        const otherIcon = item.querySelector('.version-toggle i');
                        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                    }
                });

                // 切换当前版本
                if (isActive) {
                    versionItem.classList.remove('active');
                    const icon = newHeader.querySelector('.version-toggle i');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                } else {
                    versionItem.classList.add('active');
                    const icon = newHeader.querySelector('.version-toggle i');
                    if (icon) icon.style.transform = 'rotate(180deg)';
                }
            });
        });
    }

    setupEventListeners() {
        // 下载链接点击统计
        document.addEventListener('click', (e) => {
            const downloadLink = e.target.closest('.download-link');
            if (downloadLink) {
                const filename = downloadLink.getAttribute('download') || 'unknown';
                const platform = downloadLink.closest('.download-platform')
                    ?.querySelector('h5')?.textContent || 'unknown';

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
        const originalHtml = loadMoreBtn.innerHTML;
        loadMoreBtn.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> 加载中...</span>';

        // 延迟加载，提供更好的用户体验
        setTimeout(() => {
            this.currentPage++;
            this.renderVersions();

            loadMoreBtn.disabled = false;
            loadMoreBtn.innerHTML = originalHtml;
        }, 300);
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

        // 如果需要集成Google Analytics，可以在这里添加
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download', {
                'event_category': 'history_page',
                'event_label': `${platform}_${filename}`,
                'value': 1
            });
        }
    }

    // escapeHtml(text) {
    //     const div = document.createElement('div');
    //     div.textContent = text;
    //     return div.innerHTML;
    // }
    escapeHtml(text) {
        // 创建一个临时 div 来解析 HTML
        const div = document.createElement('div');
        div.innerHTML = text;

        // 定义允许的标签和属性
        const allowedTags = {
            'a': ['href', 'target', 'rel', 'title', 'style'],
            'img': ['src', 'alt', 'title', 'width', 'height', 'style'],
            'b': [], 'strong': [], 'i': [], 'em': [], 'u': [],
            'br': [], 'p': [], 'div': [], 'span': [],
            'ul': [], 'ol': [], 'li': []
        };

        // 安全 URL 检查
        function isSafeUrl(url) {
            if (!url) return false;
            // 允许的协议
            const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'data:'];
            try {
                const parsed = new URL(url, window.location.href);
                return allowedProtocols.includes(parsed.protocol);
            } catch {
                return false;
            }
        }

        // 递归清理节点
        function sanitizeNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                return node;
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();

                // 如果不允许的标签，将其内容转为文本
                if (!allowedTags[tagName]) {
                    const text = document.createTextNode(node.outerHTML);
                    return text;
                }

                // 创建新的元素
                const newNode = document.createElement(tagName);

                // 只复制允许的属性
                const allowedAttrs = allowedTags[tagName];
                for (const attr of node.attributes) {
                    if (allowedAttrs.includes(attr.name)) {
                        // 对 href 和 src 进行特别的安全检查
                        if (attr.name === 'href' || attr.name === 'src') {
                            if (isSafeUrl(attr.value)) {
                                newNode.setAttribute(attr.name, attr.value);

                                // 如果是外部链接，添加安全属性
                                if (tagName === 'a' && attr.name === 'href' &&
                                    (attr.value.startsWith('http://') || attr.value.startsWith('https://'))) {
                                    newNode.setAttribute('target', '_blank');
                                    newNode.setAttribute('rel', 'noopener noreferrer');
                                }
                            }
                        } else {
                            newNode.setAttribute(attr.name, attr.value);
                        }
                    }
                }

                // 递归清理子节点
                while (node.firstChild) {
                    const child = node.removeChild(node.firstChild);
                    const sanitizedChild = sanitizeNode(child);
                    if (sanitizedChild) {
                        newNode.appendChild(sanitizedChild);
                    }
                }

                return newNode;
            }

            // 其他节点类型（注释等）返回 null 忽略
            return null;
        }

        // 清理 div 的所有子节点
        const sanitizedDiv = document.createElement('div');
        while (div.firstChild) {
            const child = div.removeChild(div.firstChild);
            const sanitizedChild = sanitizeNode(child);
            if (sanitizedChild) {
                sanitizedDiv.appendChild(sanitizedChild);
            }
        }

        return sanitizedDiv.innerHTML;
    }

    showError() {
        const versionsList = document.getElementById('versionsList');
        if (versionsList) {
            versionsList.innerHTML = `
                <div class="error-message glass-card" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--warning); margin-bottom: 1rem;"></i>
                    <h3 style="margin-bottom: 1rem;" data-i18n="history.error_title">加载失败</h3>
                    <p style="margin-bottom: 2rem; color: var(--text-secondary);" data-i18n="history.error_desc">无法加载版本信息，请刷新页面重试。</p>
                    <button class="btn glass-btn primary" onclick="location.reload()" style="min-width: 120px;">
                        <i class="fas fa-redo"></i>
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
                <div class="empty-state glass-card" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: var(--text-secondary); opacity: 0.5; margin-bottom: 1rem;"></i>
                    <h3 style="margin-bottom: 1rem;" data-i18n="history.no_versions">暂无版本信息</h3>
                    <p style="color: var(--text-secondary);" data-i18n="history.no_versions_desc">当前没有可用的版本记录。</p>
                </div>
            `;
        }
    }
}

// function resizeImageProportionally() {
//     const img = document.getElementById('dynamic-img');
//     const container = img.parentElement;

//     const containerWidth = container.clientWidth;
//     const containerHeight = container.clientHeight;
//     const imgNaturalWidth = img.naturalWidth;
//     const imgNaturalHeight = img.naturalHeight;

//     // 计算等比缩放的比例
//     const widthRatio = containerWidth / imgNaturalWidth;
//     const heightRatio = containerHeight / imgNaturalHeight;

//     // 使用较小的比例以确保图片完全显示
//     const scale = Math.min(widthRatio, heightRatio);

//     // 应用缩放
//     img.style.width = `${imgNaturalWidth * scale}px`;
//     img.style.height = `${imgNaturalHeight * scale}px`;
//     img.style.objectFit = 'contain';
// }

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.historyManager = new HistoryManager();
    // // 窗口大小改变时重新计算
    // window.addEventListener('resize', resizeImageProportionally);
    // window.addEventListener('load', resizeImageProportionally);
});