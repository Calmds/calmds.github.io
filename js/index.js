// 首页功能
class HomePage {
    constructor() {
        this.currentScreenshot = 1;
        this.totalScreenshots = 3;
        this.init();
    }

    init() {
        this.initScreenshotViewer();
        this.initVideoControls();
        this.initAnimations();
        this.initEventListeners();
    }

    initScreenshotViewer() {
        const viewButtons = document.querySelectorAll('.view-btn');
        const closeViewer = document.getElementById('closeViewer');
        const viewer = document.getElementById('screenshotViewer');
        const viewerImage = document.getElementById('viewerImage');
        const prevBtn = document.getElementById('prevScreenshot');
        const nextBtn = document.getElementById('nextScreenshot');

        // 点击查看大图
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const imageNum = parseInt(e.currentTarget.dataset.image);
                this.currentScreenshot = imageNum;
                this.showScreenshot(imageNum);
                viewer.classList.add('show');
                document.body.style.overflow = 'hidden';
            });
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

        // 切换截图
        prevBtn.addEventListener('click', () => {
            this.currentScreenshot = this.currentScreenshot === 1 ? this.totalScreenshots : this.currentScreenshot - 1;
            this.showScreenshot(this.currentScreenshot);
        });

        nextBtn.addEventListener('click', () => {
            this.currentScreenshot = this.currentScreenshot === this.totalScreenshots ? 1 : this.currentScreenshot + 1;
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
                    this.currentScreenshot = this.currentScreenshot === 1 ? this.totalScreenshots : this.currentScreenshot - 1;
                    this.showScreenshot(this.currentScreenshot);
                    break;
                case 'ArrowRight':
                    this.currentScreenshot = this.currentScreenshot === this.totalScreenshots ? 1 : this.currentScreenshot + 1;
                    this.showScreenshot(this.currentScreenshot);
                    break;
            }
        });
    }

    showScreenshot(imageNum) {
        const viewerImage = document.getElementById('viewerImage');
        const imagePath = `assets/images/screenshots/${imageNum}.png`;

        // 加载图片
        const img = new Image();
        img.onload = () => {
            viewerImage.src = imagePath;
            viewerImage.alt = `screenshot-${imageNum} `;
        };
        img.onerror = () => {
            // 如果图片加载失败，使用占位符
            const colors = ['#4a6fa5', '#6b5b95', '#88b04b', '#b748dcff'];
            const texts = ['时政新闻', '军事新闻', '社交媒体', '金融新闻'];
            const svg = `data:image/svg+xml;base64,${btoa(`
                <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="${colors[imageNum - 1]}"/>
                    <text x="50%" y="50%" font-family="Arial" font-size="40" fill="white" 
                          text-anchor="middle" dy="0.3em">${texts[imageNum - 1]}</text>
                </svg>
            `)}`;
            viewerImage.src = svg;
            viewerImage.alt = `Placeholder for screenshot ${imageNum}`;
        };
        img.src = imagePath;
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
        const images = document.querySelectorAll('img[data-placeholder]');
        images.forEach(img => {
            img.onerror = () => {
                const placeholderId = img.getAttribute('data-placeholder');
                this.showPlaceholderImage(img, placeholderId);
            };
        });
    }

    showPlaceholderImage(img, placeholderId) {
        const placeholderData = {
            'screenshot1': {
                color: '#4a6fa5',
                text: '主界面'
            },
            'screenshot2': {
                color: '#6b5b95',
                text: '阅读模式'
            },
            'screenshot3': {
                color: '#88b04b',
                text: '收藏管理'
            }
        };

        const data = placeholderData[placeholderId];
        if (data) {
            const svg = `data:image/svg+xml;base64,${btoa(`
                <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="${data.color}"/>
                    <text x="50%" y="50%" font-family="Arial" font-size="40" fill="white" 
                          text-anchor="middle" dy="0.3em">${data.text}</text>
                </svg>
            `)}`;
            img.src = svg;
            img.onerror = null; // 防止无限循环
        }
    }
}

// 初始化首页功能
document.addEventListener('DOMContentLoaded', () => {
    window.homePage = new HomePage();
});