// 首页功能
class HomePage {
    constructor() {
        this.carouselImages = [];
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.isPaused = false;
        this.init();
    }

    async init() {
        await this.loadCarouselImages();
        this.initCarousel();
        this.initVideoControls();
        this.initAnimations();
        this.initEventListeners();
    }

    async loadCarouselImages() {
        try {
            const response = await fetch('data/screenshot.json');
            if (response.ok) {
                this.carouselImages = await response.json();
            } else {
                console.warn('无法加载截图数据，使用默认图片');
                this.carouselImages = [
                    'assets/images/1.png',
                    'assets/images/2.png',
                    'assets/images/3.png'
                ];
            }
        } catch (error) {
            console.error('加载截图数据失败:', error);
            this.carouselImages = [
                'assets/images/1.png',
                'assets/images/2.png',
                'assets/images/3.png'
            ];
        }
    }

    initCarousel() {
        const slidesContainer = document.getElementById('carousel-slides');
        const indicatorsContainer = document.getElementById('carousel-indicators');
        
        if (!slidesContainer || !indicatorsContainer) return;

        // 生成轮播幻灯片
        slidesContainer.innerHTML = this.carouselImages.map((src, index) => `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                <img src="${src}" alt="Screenshot ${index + 1}" 
                     onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSI0YTZmYTUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIj5JbWFnZSAke2luZGV4KzF9PC90ZXh0Pjwvc3ZnPg=='"
                     loading="${index === 0 ? 'eager' : 'lazy'}">
            </div>
        `).join('');

        // 生成指示器
        indicatorsContainer.innerHTML = this.carouselImages.map((_, index) => `
            <button class="carousel-indicator ${index === 0 ? 'active' : ''}" 
                    data-index="${index}" 
                    aria-label="Go to slide ${index + 1}"></button>
        `).join('');

        // 启动自动轮播
        this.startAutoPlay();
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, 4000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    nextSlide() {
        this.goToSlide((this.currentIndex + 1) % this.carouselImages.length);
    }

    prevSlide() {
        this.goToSlide((this.currentIndex - 1 + this.carouselImages.length) % this.carouselImages.length);
    }

    goToSlide(index) {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.carousel-indicator');
        
        if (slides.length === 0) return;

        // 移除当前激活状态
        slides[this.currentIndex]?.classList.remove('active');
        indicators[this.currentIndex]?.classList.remove('active');

        // 更新索引
        this.currentIndex = index;

        // 添加新的激活状态
        slides[this.currentIndex]?.classList.add('active');
        indicators[this.currentIndex]?.classList.add('active');
    }

    pauseOnHover() {
        const carouselContainer = document.querySelector('.carousel-container');
        if (!carouselContainer) return;

        carouselContainer.addEventListener('mouseenter', () => {
            this.isPaused = true;
        });

        carouselContainer.addEventListener('mouseleave', () => {
            this.isPaused = false;
        });
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
        // 轮播控制按钮
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.prevSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }

        // 指示器点击
        const indicatorsContainer = document.getElementById('carousel-indicators');
        if (indicatorsContainer) {
            indicatorsContainer.addEventListener('click', (e) => {
                const indicator = e.target.closest('.carousel-indicator');
                if (indicator) {
                    const index = parseInt(indicator.dataset.index);
                    this.goToSlide(index);
                }
            });
        }

        // 鼠标悬停暂停轮播
        this.pauseOnHover();

        // 键盘左右箭头控制
        document.addEventListener('keydown', (e) => {
            // 只在轮播区域获得焦点或没有输入框聚焦时响应
            const activeElement = document.activeElement;
            const isInputFocused = activeElement.tagName === 'INPUT' || 
                                   activeElement.tagName === 'TEXTAREA' ||
                                   activeElement.isContentEditable;
            
            if (isInputFocused) return;

            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

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

        // 图片加载错误处理 - 已移至 img onerror 属性中处理
    }
}

// 初始化首页功能
document.addEventListener('DOMContentLoaded', () => {
    window.homePage = new HomePage();
});
