// 下载页面特定脚本
document.addEventListener('DOMContentLoaded', function () {
    console.log('下载页面加载完成');

    // 加载版本数据
    loadVersionData();

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

    // 加载版本数据的函数
    async function loadVersionData() {
        try {
            const response = await fetch('data/versions.json');
            const data = await response.json();

            // 找到最新版本
            const latestVersion = data.versions.find(v => v.latest);
            if (latestVersion) {
                updateDownloadPage(latestVersion, data);
            }
        } catch (error) {
            console.error('加载版本数据失败:', error);
            // 使用默认数据
            setupDefaultData();
        }
    }

    // 更新下载页面内容
    function updateDownloadPage(version, allData) {
        // 更新版本信息
        const versionDetails = document.querySelector('.version-details');
        if (versionDetails) {
            const versionElement = versionDetails.querySelector('.version');
            const dateElement = versionDetails.querySelector('.release-date');
            const sizeElement = versionDetails.querySelector('.file-size');

            if (versionElement) {
                versionElement.textContent = `版本: ${version.version}`;
            }

            if (dateElement) {
                dateElement.textContent = `发布日期: ${formatDate(version.release_date)}`;
            }

            if (sizeElement) {
                // 获取Windows版本的文件大小作为默认显示
                const windowsSize = version.downloads.windows?.size || '85.4 MB';
                sizeElement.textContent = `文件大小: ${windowsSize}`;
            }
        }

        // 更新更新内容
        const updateList = document.querySelector('.update-details ul');
        if (updateList && version.changelog) {
            updateList.innerHTML = '';
            version.changelog.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                updateList.appendChild(li);
            });
        }

        // 更新下载按钮信息
        updateDownloadButtons(version, allData.platforms);

        // 更新系统要求
        updateSystemRequirements(version);
    }

    // 更新下载按钮
    function updateDownloadButtons(version, platforms) {
        const windowsBtn = document.querySelector('.windows-btn');
        const macBtn = document.querySelector('.mac-btn');
        const androidBtn = document.querySelector('.android-btn');

        if (windowsBtn && version.downloads.windows) {
            updateOSButton(windowsBtn, version.downloads.windows, platforms.windows, version.version);
        }

        if (macBtn && version.downloads.macos) {
            updateOSButton(macBtn, version.downloads.macos, platforms.macos, version.version);
        }

        if (androidBtn && version.downloads.android) {
            updateOSButton(androidBtn, version.downloads.android, platforms.android, version.version);
        }
    }

    // 更新单个操作系统按钮
    function updateOSButton(button, downloadInfo, platformInfo, version) {
        const osInfo = button.querySelector('.os-info');
        if (osInfo) {
            const nameElement = osInfo.querySelector('h4');
            const descElement = osInfo.querySelector('p');
            const detailsElement = osInfo.querySelector('.os-details');

            if (nameElement) {
                nameElement.textContent = platformInfo.display_name;
            }

            if (descElement) {
                descElement.textContent = downloadInfo.requirements.split(',')[0];
            }

            if (detailsElement) {
                const archElement = detailsElement.querySelector('.os-arch');
                const sizeElement = detailsElement.querySelector('.os-size');

                if (archElement) {
                    // 显示主要架构
                    const primaryArch = downloadInfo.arch[0] || '64位';
                    archElement.textContent = primaryArch;
                }

                if (sizeElement) {
                    sizeElement.textContent = downloadInfo.size;
                }
            }
        }

        // 更新下载链接（实际项目中应该使用真实链接）
        // button.setAttribute('href', `downloads/${downloadInfo.filename}`);
    }

    // 更新系统要求
    function updateSystemRequirements(version) {
        const requirementsGrid = document.querySelector('.requirements-grid');
        if (requirementsGrid && version.downloads) {
            // Windows要求
            const windowsReq = requirementsGrid.querySelector('.requirement:nth-child(1)');
            if (windowsReq && version.downloads.windows) {
                const pElements = windowsReq.querySelectorAll('p');
                if (pElements.length >= 2) {
                    pElements[0].textContent = version.downloads.windows.requirements.split(',')[0];
                    pElements[1].textContent = version.downloads.windows.requirements.split(',')[1];
                }
            }

            // macOS要求
            const macReq = requirementsGrid.querySelector('.requirement:nth-child(2)');
            if (macReq && version.downloads.macos) {
                const pElements = macReq.querySelectorAll('p');
                if (pElements.length >= 2) {
                    pElements[0].textContent = version.downloads.macos.requirements.split(',')[0];
                    pElements[1].textContent = version.downloads.macos.requirements.split(',')[1];
                }
            }

            // Android要求
            const androidReq = requirementsGrid.querySelector('.requirement:nth-child(3)');
            if (androidReq && version.downloads.android) {
                const pElements = androidReq.querySelectorAll('p');
                if (pElements.length >= 2) {
                    pElements[0].textContent = version.downloads.android.requirements.split(',')[0];
                    pElements[1].textContent = version.downloads.android.requirements.split(',')[1];
                }
            }
        }
    }

    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }

    // 默认数据设置
    function setupDefaultData() {
        console.log('使用默认版本数据');
        // 这里可以设置默认数据或显示错误信息
    }
});