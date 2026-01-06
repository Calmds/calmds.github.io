// 通用功能
class Common {
    constructor() {
        this.init();
    }

    init() {
        this.initMobileMenu();
        this.initLanguageSelector();
        this.initActiveNav();
        this.initScrollAnimations();
    }

    initMobileMenu() {
        const toggleBtn = document.querySelector('.mobile-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (toggleBtn && navLinks) {
            toggleBtn.addEventListener('click', () => {
                navLinks.classList.toggle('show');
            });

            // 点击其他地方关闭菜单
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.mobile-toggle') &&
                    !e.target.closest('.nav-links')) {
                    navLinks.classList.remove('show');
                }
            });
        }
    }

    initLanguageSelector() {
        const languageBtn = document.querySelector('.language-btn');
        const dropdown = document.querySelector('.language-dropdown');
        const searchInput = document.querySelector('#languageSearch');

        if (languageBtn && dropdown) {
            languageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });

            // 点击其他地方关闭下拉框
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.language-selector')) {
                    dropdown.classList.remove('show');
                }
            });

            // 搜索功能
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const items = dropdown.querySelectorAll('.language-item');

                    items.forEach(item => {
                        const text = item.textContent.toLowerCase();
                        item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
                    });
                });
            }

            // 防止下拉框点击关闭
            dropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    initActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-links a');

        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage ||
                (currentPage === '' && linkPage === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    initScrollAnimations() {
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
        document.querySelectorAll('.fade-in-up, .animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    // 显示Toast通知
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            color: ${type === 'success' ? '#10b981' : '#ef4444'};
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// 图片占位符处理
class ImagePlaceholder {
    constructor() {
        this.init();
    }

    init() {
        this.placeholderData = {
            screenshot1: {
                color: '#4a6fa5',
                text: '主界面'
            },
            screenshot2: {
                color: '#6b5b95',
                text: '阅读模式'
            },
            screenshot3: {
                color: '#88b04b',
                text: '收藏管理'
            }
        };
    }

    generatePlaceholderSVG(color, text) {
        return `data:image/svg+xml;base64,${btoa(`
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="${color}"/>
                <text x="50%" y="50%" font-family="Arial" font-size="40" fill="white" 
                      text-anchor="middle" dy="0.3em">${text}</text>
            </svg>
        `)}`;
    }

    initPlaceholders() {
        const images = document.querySelectorAll('img[data-placeholder]');

        images.forEach(img => {
            const placeholderId = img.getAttribute('data-placeholder');
            const placeholder = this.placeholderData[placeholderId];

            if (placeholder && !img.complete) {
                img.onerror = () => {
                    img.src = this.generatePlaceholderSVG(placeholder.color, placeholder.text);
                    img.onerror = null;
                };
            }
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.common = new Common();
    window.imagePlaceholder = new ImagePlaceholder();
    imagePlaceholder.initPlaceholders();
});