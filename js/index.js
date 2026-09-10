// 首页功能
class HomePage {
    constructor() {
        this.photoWall = null;
        this.visitCounter = null;
        this.init();
    }

    async init() {
        await this.initPhotoWall();
        await this.initVisitCounter();
        this.initVideoControls();
        this.initAnimations();
        this.initEventListeners();
    }

    async initPhotoWall() {
        if (typeof PhotoWallComponent !== 'undefined') {
            this.photoWall = new PhotoWallComponent({
                containerId: 'photo-wall-container',
                dataFile: 'data/screenshot.json',
                enableViewer: true
            });
            await this.photoWall.init();
        } else {
            console.error('PhotoWallComponent not loaded');
        }
    }

    async initVisitCounter() {
        if (typeof VisitCounterComponent !== 'undefined') {
            this.visitCounter = new VisitCounterComponent({
                containerId: 'visit-counter-container',
                dataFile: 'data/visits/count.json',
                autoIncrement: true,
                showDetails: true
            });
            
            // 尝试从 localStorage 恢复数据（用于静态页面）
            const restored = this.visitCounter.restoreFromLocalStorage();
            
            await this.visitCounter.init();
        } else {
            console.error('VisitCounterComponent not loaded');
        }
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
