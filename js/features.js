// 功能特性页面特定脚本
document.addEventListener('DOMContentLoaded', function () {
    console.log('功能特性页面加载完成');

    // 平滑滚动到锚点
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // 如果是页面内锚点链接
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 添加功能区域的滚动动画
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

    // 观察所有功能区域
    const featureSections = document.querySelectorAll('.features-section');
    featureSections.forEach(section => {
        observer.observe(section);
    });

    // 添加功能卡片悬停效果
    const featureDetails = document.querySelectorAll('.feature-detail');

    featureDetails.forEach(detail => {
        detail.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px)';
        });

        detail.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
});