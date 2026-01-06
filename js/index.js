// 首页特定脚本
document.addEventListener('DOMContentLoaded', function () {
    // 首页可能需要的特定功能
    console.log('首页加载完成');

    // 可以添加首页特定的动画效果
    const previewCards = document.querySelectorAll('.preview-card');

    // 添加卡片悬停效果增强
    previewCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 添加滚动动画效果
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
    const elementsToAnimate = document.querySelectorAll('.hero, .preview-section, .download-guide');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
});