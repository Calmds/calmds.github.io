// 首页功能
class HomePage {
    constructor() {
        this.currentScreenshot = 0;  // 改为从0开始
        this.totalScreenshots = 0;
        this.screenshots = [];
        this.init();
    }

    async init() {
        await this.initScreenshots();  // 先初始化截图数据
        this.initScreenshotViewer();
        this.initVideoControls();
        this.initAnimations();
        this.initEventListeners();
    }

    async initScreenshots() {
        try {
            const response = await fetch('data/screenshot.json');
            if (!response.ok) throw new Error('Failed to load screenshot data');
            this.screenshots = await response.json();
            this.totalScreenshots = this.screenshots.length;

            const screenshotGrid = document.getElementById('screenshot-grid');
            screenshotGrid.innerHTML = '';  // 清空现有内容

            const fragment = document.createDocumentFragment();
            this.screenshots.forEach((link, index) => {
                const div = document.createElement('div');
                div.className = 'screenshot-item glass-card';
                div.innerHTML = `
                <div class="screenshot-image">
                    <img src="${link}" data-index="${index}" loading="lazy" id="screenshot-${index}" alt="Screenshot ${index + 1}">
                </div>`;
                fragment.appendChild(div);
            });

            screenshotGrid.appendChild(fragment);
        } catch (error) {
            console.error('Error loading screenshots:', error);
            // 显示错误信息
            const screenshotGrid = document.getElementById('screenshot-grid');
            if (screenshotGrid) {
                screenshotGrid.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>无法加载截图数据</p>
                    </div>
                `;
            }
        }
    }

    initScreenshotViewer() {
        const closeViewer = document.getElementById('closeViewer');
        const viewer = document.getElementById('screenshotViewer');
        const prevBtn = document.getElementById('prevScreenshot');
        const nextBtn = document.getElementById('nextScreenshot');
        const viewerImage = document.getElementById('viewerImage');
        const currentIndicator = document.querySelector('.current-indicator');

        // 更新指示器
        const updateIndicator = () => {
            if (currentIndicator) {
                currentIndicator.textContent = `${this.currentScreenshot + 1} / ${this.totalScreenshots}`;
            }
        };

        // 显示截图查看器
        this.showScreenshot = (index) => {
            if (index < 0 || index >= this.totalScreenshots) return;

            this.currentScreenshot = index;
            const imagePath = this.screenshots[index];

            // 加载图片
            const img = new Image();
            img.onload = () => {
                viewerImage.src = imagePath;
                viewerImage.alt = `Screenshot ${index + 1}`;
                updateIndicator();
            };

            img.onerror = () => {
                // 如果图片加载失败，使用占位符
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

        // 点击截图图片打开查看器
        document.addEventListener('click', (e) => {
            const screenshotImg = e.target.closest('#screenshot-grid img');
            if (screenshotImg) {
                const index = parseInt(screenshotImg.getAttribute('data-index'));
                console.log("点击查看大图", index, this.screenshots[index]);
                this.currentScreenshot = index;
                this.showScreenshot(index);
                viewer.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });

        // 关闭查看器
        closeViewer.addEventListener('click', () => {
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

        // 切换截图 - 上一张
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止事件冒泡
            this.currentScreenshot = this.currentScreenshot === 0 ? this.totalScreenshots - 1 : this.currentScreenshot - 1;
            this.showScreenshot(this.currentScreenshot);
        });

        // 切换截图 - 下一张
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止事件冒泡
            this.currentScreenshot = this.currentScreenshot === this.totalScreenshots - 1 ? 0 : this.currentScreenshot + 1;
            this.showScreenshot(this.currentScreenshot);
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
                    this.currentScreenshot = this.currentScreenshot === 0 ? this.totalScreenshots - 1 : this.currentScreenshot - 1;
                    this.showScreenshot(this.currentScreenshot);
                    break;
                case 'ArrowRight':
                    this.currentScreenshot = this.currentScreenshot === this.totalScreenshots - 1 ? 0 : this.currentScreenshot + 1;
                    this.showScreenshot(this.currentScreenshot);
                    break;
            }
        });

        // 初始更新指示器
        updateIndicator();
    }

    initVideoControls() {
        const playButtons = document.querySelectorAll('.play-btn');

        playButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const videoPlayer = e.target.closest('.video-player');
                const video = videoPlayer.querySelector('video');

                if (video.paused) {
                    video.play();
                    e.target.innerHTML = '<i class="fas fa-pause"></i>';
                } else {
                    video.pause();
                    e.target.innerHTML = '<i class="fas fa-play"></i>';
                }
            });
        });

        // 视频播放状态更新
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.addEventListener('play', (e) => {
                const playBtn = e.target.closest('.video-player').querySelector('.play-btn');
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            });

            video.addEventListener('pause', (e) => {
                const playBtn = e.target.closest('.video-player').querySelector('.play-btn');
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
            });
        });
    }

    initAnimations() {
        // 观察器配置
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

        // 观察需要动画的元素
        document.querySelectorAll('.screenshot-item, .video-item, .preview-card, .guide-content').forEach(el => {
            observer.observe(el);
        });

        // 为预览卡片添加延迟动画
        const previewCards = document.querySelectorAll('.preview-card');
        previewCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.2}s`;
            card.classList.add('fade-in-up');
        });
    }

    initEventListeners() {
        // 查看更多视频按钮
        const viewMoreBtn = document.getElementById('viewMoreVideos');
        if (viewMoreBtn) {
            viewMoreBtn.addEventListener('click', () => {
                // 这里可以添加加载更多视频的功能
                if (window.common) {
                    window.common.showToast('更多视频功能开发中...', 'info');
                }
            });
        }

        // 图片加载错误处理
        const images = document.querySelectorAll('img[data-index]');
        images.forEach(img => {
            img.addEventListener('error', () => {
                this.showPlaceholderImage(img);
            });
        });
    }

    showPlaceholderImage(img) {
        const index = img.getAttribute('data-index');
        const svg = `data:image/svg+xml;base64,${btoa(`
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#4a6fa5"/>
                <text x="50%" y="50%" font-family="Arial" font-size="30" fill="white" text-anchor="middle" dy="0.3em">Image ${parseInt(index) + 1}</text>
            </svg>
        `)}`;
        img.src = svg;
        img.onerror = null; // 防止无限循环
    }
}

// 初始化首页功能
document.addEventListener('DOMContentLoaded', () => {
    window.homePage = new HomePage();
});