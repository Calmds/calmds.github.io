// 历史版本页面特定脚本
document.addEventListener('DOMContentLoaded', function () {
    console.log('历史版本页面加载完成');

    // 加载版本数据
    loadVersionData();

    // 历史版本页面筛选功能
    const filterButtons = document.querySelectorAll('.filter-btn');
    const versionItems = document.querySelectorAll('.version-item');

    if (filterButtons.length > 0 && versionItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                // 移除所有按钮的active类
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // 为当前点击的按钮添加active类
                this.classList.add('active');

                const filter = this.getAttribute('data-filter');

                // 筛选版本项目
                versionItems.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = 'table-row';
                    } else {
                        const itemVersion = item.getAttribute('data-version');
                        const itemPlatform = item.getAttribute('data-platform');

                        if (filter === itemVersion || filter === itemPlatform ||
                            (filter === 'major' && itemVersion === 'major') ||
                            (filter === 'windows' && itemPlatform.includes('windows')) ||
                            (filter === 'mac' && itemPlatform.includes('mac')) ||
                            (filter === 'android' && itemPlatform.includes('android'))) {
                            item.style.display = 'table-row';
                        } else {
                            item.style.display = 'none';
                        }
                    }
                });
            });
        });
    }

    // 下载链接点击处理
    const downloadLinks = document.querySelectorAll('.download-link');

    downloadLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();

                // 获取版本信息
                const versionTag = this.closest('tr')?.querySelector('.version-tag');
                const version = versionTag ? versionTag.textContent : '历史版本';

                // 获取平台信息
                let platform = '';
                const icon = this.querySelector('i');
                if (icon) {
                    if (icon.classList.contains('fa-windows')) {
                        platform = 'Windows';
                    } else if (icon.classList.contains('fa-apple')) {
                        platform = 'macOS';
                    } else if (icon.classList.contains('fa-android')) {
                        platform = 'Android';
                    }
                }

                alert(`感谢您下载 ${platform} 的 ${version}！\n\n由于我们是一个演示网站，实际下载功能需要您自行实现。\n您可以在实际项目中添加真实的下载链接。`);
            }
        });
    });

    // 添加表格行悬停效果增强
    versionItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            this.style.backgroundColor = '#f0f7ff';
        });

        item.addEventListener('mouseleave', function () {
            this.style.backgroundColor = '';
        });
    });

    // 添加版本说明卡片动画
    const notes = document.querySelectorAll('.note');

    const notesObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.2
    });

    notes.forEach((note, index) => {
        note.style.opacity = '0';
        note.style.transform = 'translateY(20px)';
        note.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        note.style.transitionDelay = `${index * 0.1}s`;

        notesObserver.observe(note);
    });

    // 加载版本数据的函数
    async function loadVersionData() {
        try {
            const response = await fetch('data/versions.json');
            const data = await response.json();

            // 更新历史版本表格
            updateHistoryTable(data);
        } catch (error) {
            console.error('加载版本数据失败:', error);
            // 使用默认数据
            setupDefaultHistoryData();
        }
    }

    // 更新历史版本表格
    function updateHistoryTable(data) {
        const tbody = document.querySelector('.history-table tbody');
        if (!tbody) return;

        // 清空现有内容
        tbody.innerHTML = '';

        // 添加版本行（从第二个版本开始，因为第一个是最新版本）
        data.versions.slice(1).forEach(version => {
            const row = createVersionRow(version, data.platforms);
            tbody.appendChild(row);
        });

        // 重新绑定事件
        bindTableEvents();
    }

    // 创建版本行
    function createVersionRow(version, platforms) {
        const tr = document.createElement('tr');
        tr.className = 'version-item';
        tr.setAttribute('data-version', version.version.includes('0') ? 'minor' : 'major');
        tr.setAttribute('data-platform', 'all');

        // 版本号单元格
        const versionTd = document.createElement('td');
        versionTd.innerHTML = `
            <span class="version-tag">v${version.version}</span>
            ${version.downloads.windows ? '<span class="platform-tag windows">Windows</span>' : ''}
            ${version.downloads.macos ? '<span class="platform-tag mac">macOS</span>' : ''}
            ${version.downloads.android ? '<span class="platform-tag android">Android</span>' : ''}
        `;

        // 发布日期单元格
        const dateTd = document.createElement('td');
        dateTd.textContent = formatDate(version.release_date);

        // 更新内容单元格
        const updatesTd = document.createElement('td');
        const updatesUl = document.createElement('ul');
        updatesUl.className = 'version-updates';

        version.changelog.slice(0, 3).forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            updatesUl.appendChild(li);
        });

        if (version.changelog.length > 3) {
            const li = document.createElement('li');
            li.textContent = `...等 ${version.changelog.length - 3} 项更新`;
            li.style.color = 'var(--gray-color)';
            li.style.fontStyle = 'italic';
            updatesUl.appendChild(li);
        }

        updatesTd.appendChild(updatesUl);

        // 下载链接单元格
        const downloadTd = document.createElement('td');
        const downloadActions = document.createElement('div');
        downloadActions.className = 'download-actions';

        // 添加各平台下载链接
        if (version.downloads.windows) {
            const windowsLink = createDownloadLink('windows', platforms.windows, version);
            downloadActions.appendChild(windowsLink);
        }

        if (version.downloads.macos) {
            const macLink = createDownloadLink('macos', platforms.macos, version);
            downloadActions.appendChild(macLink);
        }

        if (version.downloads.android) {
            const androidLink = createDownloadLink('android', platforms.android, version);
            downloadActions.appendChild(androidLink);
        }

        downloadTd.appendChild(downloadActions);

        // 组装行
        tr.appendChild(versionTd);
        tr.appendChild(dateTd);
        tr.appendChild(updatesTd);
        tr.appendChild(downloadTd);

        return tr;
    }

    // 创建下载链接
    function createDownloadLink(platformKey, platformInfo, version) {
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'download-link';
        link.innerHTML = `<i class="${platformInfo.icon}"></i> ${platformInfo.display_name}`;

        // 添加点击事件
        link.addEventListener('click', function (e) {
            e.preventDefault();
            alert(`感谢您下载 ${platformInfo.display_name} 的 v${version.version}！\n\n由于我们是一个演示网站，实际下载功能需要您自行实现。\n您可以在实际项目中添加真实的下载链接。`);
        });

        return link;
    }

    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }

    // 重新绑定表格事件
    function bindTableEvents() {
        // 下载链接点击处理
        const downloadLinks = document.querySelectorAll('.download-link');
        downloadLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                if (this.getAttribute('href') === '#') {
                    e.preventDefault();

                    const platform = this.textContent.trim().split(' ')[0];
                    const version = this.closest('tr')?.querySelector('.version-tag')?.textContent || '历史版本';

                    alert(`感谢您下载 ${platform} 的 ${version}！\n\n由于我们是一个演示网站，实际下载功能需要您自行实现。\n您可以在实际项目中添加真实的下载链接。`);
                }
            });
        });

        // 表格行悬停效果
        const versionItems = document.querySelectorAll('.version-item');
        versionItems.forEach(item => {
            item.addEventListener('mouseenter', function () {
                this.style.backgroundColor = '#f0f7ff';
            });

            item.addEventListener('mouseleave', function () {
                this.style.backgroundColor = '';
            });
        });
    }

    // 默认数据设置
    function setupDefaultHistoryData() {
        console.log('使用默认历史版本数据');
        // 保持现有表格内容不变
    }
});