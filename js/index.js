// 首页特定脚本
document.addEventListener('DOMContentLoaded', function () {
    console.log('首页加载完成');

    // 截图查看器功能
    setupScreenshotViewer();

    // 视频播放功能
    setupVideoPlayers();

    // 视频库功能
    setupVideoLibrary();

    // 首页动画效果
    setupAnimations();

    // 监听语言变化
    document.addEventListener('languageChange', function () {
        // 语言变化后可以重新初始化一些内容
        console.log('语言已变更，更新页面内容');
    });
});

// 设置截图查看器
function setupScreenshotViewer() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const screenshotViewer = document.getElementById('screenshotViewer');
    const closeViewer = document.getElementById('closeViewer');
    const viewerImage = document.getElementById('viewerImage');
    const prevButton = document.getElementById('prevScreenshot');
    const nextButton = document.getElementById('nextScreenshot');

    if (!screenshotViewer) return;

    let currentScreenshotIndex = 0;
    const screenshotImages = [
        { src: 'assets/images/screenshots/screenshot1.png', alt: '新闻助手主界面' },
        { src: 'assets/images/screenshots/screenshot2.png', alt: '新闻助手阅读模式' },
        { src: 'assets/images/screenshots/screenshot3.png', alt: '新闻助手收藏管理' }
    ];

    // 打开查看器
    viewButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            currentScreenshotIndex = index;
            openScreenshotViewer(currentScreenshotIndex);
        });
    });

    // 关闭查看器
    closeViewer.addEventListener('click', closeScreenshotViewer);

    // 点击背景关闭查看器
    screenshotViewer.addEventListener('click', (e) => {
        if (e.target === screenshotViewer) {
            closeScreenshotViewer();
        }
    });

    // 上一张
    prevButton.addEventListener('click', () => {
        currentScreenshotIndex = (currentScreenshotIndex - 1 + screenshotImages.length) % screenshotImages.length;
        updateViewerImage(currentScreenshotIndex);
    });

    // 下一张
    nextButton.addEventListener('click', () => {
        currentScreenshotIndex = (currentScreenshotIndex + 1) % screenshotImages.length;
        updateViewerImage(currentScreenshotIndex);
    });

    // 键盘导航
    document.addEventListener('keydown', (e) => {
        if (screenshotViewer.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeScreenshotViewer();
            } else if (e.key === 'ArrowLeft') {
                currentScreenshotIndex = (currentScreenshotIndex - 1 + screenshotImages.length) % screenshotImages.length;
                updateViewerImage(currentScreenshotIndex);
            } else if (e.key === 'ArrowRight') {
                currentScreenshotIndex = (currentScreenshotIndex + 1) % screenshotImages.length;
                updateViewerImage(currentScreenshotIndex);
            }
        }
    });

    // 打开查看器函数
    function openScreenshotViewer(index) {
        updateViewerImage(index);
        screenshotViewer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // 关闭查看器函数
    function closeScreenshotViewer() {
        screenshotViewer.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // 更新查看器图片
    function updateViewerImage(index) {
        const image = screenshotImages[index];
        viewerImage.src = image.src;
        viewerImage.alt = image.alt;
    }
}

// 设置视频播放器
function setupVideoPlayers() {
    const demoVideo = document.getElementById('demoVideo');
    const tutorialVideo = document.getElementById('tutorialVideo');
    const playDemoBtn = document.getElementById('playDemo');
    const playTutorialBtn = document.getElementById('playTutorial');

    // 演示视频控制
    if (demoVideo && playDemoBtn) {
        setupVideoControls(demoVideo, playDemoBtn);
    }

    // 教程视频控制
    if (tutorialVideo && playTutorialBtn) {
        setupVideoControls(tutorialVideo, playTutorialBtn);
    }
}

// 设置视频控制
function setupVideoControls(video, playButton) {
    const videoPlayer = video.parentElement;

    // 播放/暂停控制
    playButton.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            videoPlayer.classList.add('playing');
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            video.pause();
            videoPlayer.classList.remove('playing');
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    // 视频播放时更新按钮
    video.addEventListener('play', () => {
        videoPlayer.classList.add('playing');
        playButton.innerHTML = '<i class="fas fa-pause"></i>';
    });

    // 视频暂停时更新按钮
    video.addEventListener('pause', () => {
        videoPlayer.classList.remove('playing');
        playButton.innerHTML = '<i class="fas fa-play"></i>';
    });

    // 视频结束时重置
    video.addEventListener('ended', () => {
        videoPlayer.classList.remove('playing');
        playButton.innerHTML = '<i class="fas fa-play"></i>';
    });

    // 点击视频播放器控制播放
    videoPlayer.addEventListener('click', (e) => {
        if (e.target === videoPlayer || e.target === video) {
            if (video.paused) {
                video.play();
                videoPlayer.classList.add('playing');
                playButton.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                video.pause();
                videoPlayer.classList.remove('playing');
                playButton.innerHTML = '<i class="fas fa-play"></i>';
            }
        }
    });
}

// 设置视频库
function setupVideoLibrary() {
    const viewMoreBtn = document.getElementById('viewMoreVideos');
    const videoLibrary = document.getElementById('videoLibrary');
    const closeLibrary = document.getElementById('closeLibrary');
    const libraryGrid = document.getElementById('libraryGrid');

    if (!viewMoreBtn || !videoLibrary) return;

    // 视频库数据
    const videoLibraryData = [
        {
            id: 1,
            title: '功能演示',
            description: '了解新闻助手的主要功能',
            duration: '3:45',
            date: '2024-06-15',
            thumbnail: 'assets/images/thumbnails/demo-thumbnail.jpg',
            video: 'assets/videos/demo.mp4'
        },
        {
            id: 2,
            title: '使用教程',
            description: '快速上手新闻助手',
            duration: '5:20',
            date: '2024-06-10',
            thumbnail: 'assets/images/thumbnails/tutorial-thumbnail.jpg',
            video: 'assets/videos/tutorial.mp4'
        },
        {
            id: 3,
            title: '智能推荐功能',
            description: 'AI个性化推荐系统介绍',
            duration: '2:30',
            date: '2024-06-05',
            thumbnail: 'assets/images/thumbnails/recommendation-thumbnail.jpg',
            video: 'assets/videos/recommendation.mp4'
        },
        {
            id: 4,
            title: '离线阅读指南',
            description: '如何有效使用离线阅读功能',
            duration: '4:15',
            date: '2024-05-28',
            thumbnail: 'assets/images/thumbnails/offline-thumbnail.jpg',
            video: 'assets/videos/offline.mp4'
        },
        {
            id: 5,
            title: '多端同步设置',
            description: '配置设备同步功能',
            duration: '3:10',
            date: '2024-05-20',
            thumbnail: 'assets/images/thumbnails/sync-thumbnail.jpg',
            video: 'assets/videos/sync.mp4'
        },
        {
            id: 6,
            title: '隐私保护功能',
            description: '了解我们的隐私保护措施',
            duration: '2:45',
            date: '2024-05-15',
            thumbnail: 'assets/images/thumbnails/privacy-thumbnail.jpg',
            video: 'assets/videos/privacy.mp4'
        }
    ];

    // 打开视频库
    viewMoreBtn.addEventListener('click', openVideoLibrary);

    // 关闭视频库
    closeLibrary.addEventListener('click', closeVideoLibrary);

    // 点击背景关闭视频库
    videoLibrary.addEventListener('click', (e) => {
        if (e.target === videoLibrary) {
            closeVideoLibrary();
        }
    });

    // 键盘关闭
    document.addEventListener('keydown', (e) => {
        if (videoLibrary.classList.contains('active') && e.key === 'Escape') {
            closeVideoLibrary();
        }
    });

    // 填充视频库
    function populateVideoLibrary() {
        if (!libraryGrid) return;

        libraryGrid.innerHTML = '';

        videoLibraryData.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.className = 'library-video';
            videoElement.dataset.videoId = video.id;

            videoElement.innerHTML = `
                <div class="library-video-thumb">
                    <img src="${video.thumbnail}" alt="${video.title}">
                </div>
                <div class="library-video-info">
                    <h4>${video.title}</h4>
                    <p>${video.description}</p>
                    <div class="library-video-meta">
                        <span><i class="far fa-clock"></i> ${video.duration}</span>
                        <span><i class="far fa-calendar"></i> ${video.date}</span>
                    </div>
                </div>
            `;

            // 点击播放视频
            videoElement.addEventListener('click', () => {
                playVideoInLibrary(video);
            });

            libraryGrid.appendChild(videoElement);
        });
    }

    // 打开视频库
    function openVideoLibrary() {
        populateVideoLibrary();
        videoLibrary.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // 关闭视频库
    function closeVideoLibrary() {
        videoLibrary.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // 播放视频库中的视频
    function playVideoInLibrary(videoData) {
        // 在实际项目中，这里可以打开一个新的视频播放器或者跳转到视频页面
        alert(`播放视频: ${videoData.title}\n\n在实际项目中，这里会播放视频。`);
    }
}

// 设置动画效果
function setupAnimations() {
    // 卡片悬停效果增强
    const previewCards = document.querySelectorAll('.preview-card');

    previewCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 截图卡片悬停效果
    const screenshotItems = document.querySelectorAll('.screenshot-item');

    screenshotItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px)';
        });

        item.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });

    // 视频卡片悬停效果
    const videoItems = document.querySelectorAll('.video-item');

    videoItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px)';
        });

        item.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });

    // 滚动动画效果
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // 观察页面中的主要元素
    const elementsToAnimate = document.querySelectorAll('.hero, .screenshots-section, .videos-section, .preview-section, .download-guide');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}