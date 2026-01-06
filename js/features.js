// 功能页面功能
class FeaturesPage {
    constructor() {
        this.init();
    }

    init() {
        this.initAnimations();
        this.initScrollSpy();
        this.initHoverEffects();
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

        // 观察所有功能卡片和技术特点卡片
        document.querySelectorAll('.feature-card, .tech-item').forEach(card => {
            observer.observe(card);
        });

        // 为卡片添加延迟动画
        const cards = document.querySelectorAll('.feature-card, .tech-item');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }

    initScrollSpy() {
        // 监听滚动，高亮当前滚动到的功能部分
        const sections = document.querySelectorAll('.feature-card[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

        const observerOptions = {
            threshold: 0.6,
            rootMargin: '-100px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    initHoverEffects() {
        // 为功能图标添加旋转效果
        const featureIcons = document.querySelectorAll('.feature-icon');

        featureIcons.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.transform = 'rotateY(180deg)';
            });

            icon.addEventListener('mouseleave', () => {
                icon.style.transform = 'rotateY(0deg)';
            });
        });

        // 为卡片添加悬停效果
        const cards = document.querySelectorAll('.feature-card, .tech-item');

        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    // 滚动到指定功能
    scrollToFeature(featureId) {
        const element = document.getElementById(featureId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// 初始化功能页面
document.addEventListener('DOMContentLoaded', () => {
    window.featuresPage = new FeaturesPage();

    // 处理哈希链接（如果URL中有#）
    if (window.location.hash) {
        const featureId = window.location.hash.substring(1);
        setTimeout(() => {
            window.featuresPage.scrollToFeature(featureId);
        }, 100);
    }
});