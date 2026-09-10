/**
 * 照片墙组件
 * 用于展示和管理应用截图
 */

class PhotoWallComponent {
    constructor(options = {}) {
        this.containerId = options.containerId || 'photo-wall-container';
        this.dataFile = options.dataFile || 'data/screenshot.json';
        this.gridColumns = options.gridColumns || 'repeat(auto-fit, minmax(300px, 1fr))';
        this.enableViewer = options.enableViewer !== false;
        this.currentScreenshot = 0;
        this.screenshots = [];
        this.viewerElement = null;
    }

    /**
     * 初始化照片墙
     */
    async init() {
        await this.loadScreenshots();
        this.render();
        if (this.enableViewer) {
            this.initViewer();
        }
        this.initAnimations();
    }

    /**
     * 加载截图数据
     */
    async loadScreenshots() {
        try {
            const response = await fetch(this.dataFile);
            if (!response.ok) throw new Error('Failed to load screenshot data');
            this.screenshots = await response.json();
        } catch (error) {
            console.error('Error loading screenshots:', error);
            this.screenshots = [];
        }
    }

    /**
     * 渲染照片墙
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with id '${this.containerId}' not found`);
            return;
        }

        container.innerHTML = '';

        if (this.screenshots.length === 0) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>暂无截图数据</p>
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();
        this.screenshots.forEach((link, index) => {
            const div = document.createElement('div');
            div.className = 'screenshot-item glass-card';
            div.innerHTML = `
                <div class="screenshot-image">
                    <img src="${link}" data-index="${index}" loading="lazy" alt="Screenshot ${index + 1}">
                </div>
            `;
            fragment.appendChild(div);
        });

        container.appendChild(fragment);
    }

    /**
     * 初始化查看器
     */
    initViewer() {
        // 创建查看器 DOM
        const viewerHTML = `
            <div class="screenshot-viewer" id="screenshotViewer">
                <div class="viewer-content">
                    <button class="close-viewer" id="closeViewer">&times;</button>
                    <div class="viewer-image-container">
                        <img id="viewerImage" src="" alt="">
                    </div>
                    <div class="viewer-controls">
                        <button class="viewer-btn prev-btn" id="prevScreenshot">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <span class="current-indicator">${this.currentScreenshot + 1} / ${this.screenshots.length}</span>
                        <button class="viewer-btn next-btn" id="nextScreenshot">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', viewerHTML);

        const viewer = document.getElementById('screenshotViewer');
        const closeBtn = document.getElementById('closeViewer');
        const prevBtn = document.getElementById('prevScreenshot');
        const nextBtn = document.getElementById('nextScreenshot');
        const viewerImage = document.getElementById('viewerImage');
        const indicator = viewer.querySelector('.current-indicator');

        const updateIndicator = () => {
            if (indicator) {
                indicator.textContent = `${this.currentScreenshot + 1} / ${this.screenshots.length}`;
            }
        };

        const showScreenshot = (index) => {
            if (index < 0 || index >= this.screenshots.length) return;

            this.currentScreenshot = index;
            const imagePath = this.screenshots[index];

            const img = new Image();
            img.onload = () => {
                viewerImage.src = imagePath;
                viewerImage.alt = `Screenshot ${index + 1}`;
                updateIndicator();
            };

            img.onerror = () => {
                const svg = `data:image/svg+xml;base64,${btoa(`
                    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill="#4a6fa5"/>
                        <text x="50%" y="50%" font-family="Arial" font-size="30" fill="white" text-anchor="middle" dy="0.3em">Image ${index + 1}</text>
                    </svg>
                `)}`;
                viewerImage.src = svg;
                viewerImage.alt = `Placeholder for screenshot ${index + 1}`;
                updateIndicator();
            };
            img.src = imagePath;
        };

        // 点击截图打开查看器
        document.addEventListener('click', (e) => {
            const screenshotImg = e.target.closest('#' + this.containerId + ' img');
            if (screenshotImg) {
                const index = parseInt(screenshotImg.getAttribute('data-index'));
                this.currentScreenshot = index;
                showScreenshot(index);
                viewer.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });

        // 关闭查看器
        closeBtn.addEventListener('click', () => {
            viewer.classList.remove('show');
            document.body.style.overflow = 'auto';
        });

        // 点击背景关闭
        viewer.addEventListener('click', (e) => {
            if (e.target === viewer) {
                viewer.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });

        // 上一张
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.currentScreenshot = this.currentScreenshot === 0 ? this.screenshots.length - 1 : this.currentScreenshot - 1;
            showScreenshot(this.currentScreenshot);
        });

        // 下一张
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.currentScreenshot = this.currentScreenshot === this.screenshots.length - 1 ? 0 : this.currentScreenshot + 1;
            showScreenshot(this.currentScreenshot);
        });

        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (!viewer.classList.contains('show')) return;

            switch (e.key) {
                case 'Escape':
                    viewer.classList.remove('show');
                    document.body.style.overflow = 'auto';
                    break;
                case 'ArrowLeft':
                    this.currentScreenshot = this.currentScreenshot === 0 ? this.screenshots.length - 1 : this.currentScreenshot - 1;
                    showScreenshot(this.currentScreenshot);
                    break;
                case 'ArrowRight':
                    this.currentScreenshot = this.currentScreenshot === this.screenshots.length - 1 ? 0 : this.currentScreenshot + 1;
                    showScreenshot(this.currentScreenshot);
                    break;
            }
        });

        updateIndicator();
    }

    /**
     * 初始化动画
     */
    initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.screenshot-item').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * 刷新截图数据
     */
    async refresh() {
        await this.loadScreenshots();
        this.render();
        if (this.enableViewer && !document.getElementById('screenshotViewer')) {
            this.initViewer();
        }
    }

    /**
     * 获取当前截图数量
     */
    getCount() {
        return this.screenshots.length;
    }

    /**
     * 获取所有截图
     */
    getScreenshots() {
        return [...this.screenshots];
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhotoWallComponent;
}
