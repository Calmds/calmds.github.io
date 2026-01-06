// 下载页面特定脚本
document.addEventListener('DOMContentLoaded', function () {
    console.log('下载页面加载完成');

    // 下载按钮点击处理
    const downloadButtons = document.querySelectorAll('.os-btn, .download-link');

    downloadButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            // 如果链接是#，则阻止默认行为并显示提示
            if (this.getAttribute('href') === '#') {
                e.preventDefault();

                // 获取版本信息
                let version = '最新版本';
                const versionElement = document.querySelector('.version-details .version');
                if (versionElement) {
                    version = versionElement.textContent;
                }

                // 获取操作系统信息
                let osInfo = '';
                const osElement = this.querySelector('.os-info h4') ||
                    this.querySelector('i')?.nextSibling?.textContent?.trim();
                if (osElement) {
                    osInfo = typeof osElement === 'string' ? osElement : osElement.textContent;
                }

                // 显示提示信息
                if (osInfo) {
                    alert(`感谢您下载 ${osInfo} 的 ${version}！\n\n由于我们是一个演示网站，实际下载功能需要您自行实现。\n您可以在实际项目中添加真实的下载链接。`);
                } else {
                    alert(`感谢您下载 ${version}！\n\n由于我们是一个演示网站，实际下载功能需要您自行实现。\n您可以在实际项目中添加真实的下载链接。`);
                }
            }
        });
    });

    // 添加下载按钮悬停效果
    const osButtons = document.querySelectorAll('.os-btn');

    osButtons.forEach(button => {
        button.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });

        button.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 添加安装步骤动画
    const steps = document.querySelectorAll('.step');

    const stepsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.2
    });

    steps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
        step.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        step.style.transitionDelay = `${index * 0.1}s`;

        stepsObserver.observe(step);
    });
});