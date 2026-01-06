// 纯静态多语言管理器
class StaticLanguageManager {
    constructor() {
        this.currentLang = 'zh-CN';
        this.initialized = false;

        // 初始化
        this.init();
    }

    // 初始化语言管理器
    init() {
        if (this.initialized) return;

        // 从本地存储获取用户选择的语言
        const savedLang = localStorage.getItem('news-assistant-language');

        // 检测浏览器语言
        const browserLang = LanguageConfig.getBrowserLanguage();

        // 设置当前语言（优先使用保存的语言，其次是浏览器语言，最后是默认中文）
        if (savedLang && LanguageConfig.isLanguageSupported(savedLang)) {
            this.currentLang = savedLang;
        } else if (browserLang && LanguageConfig.isLanguageSupported(browserLang)) {
            this.currentLang = browserLang;
        } else {
            this.currentLang = 'zh-CN';
        }

        // 应用当前语言
        this.applyLanguage(this.currentLang);

        // 初始化语言选择器
        this.initLanguageSelector();

        this.initialized = true;
    }

    // 应用语言
    applyLanguage(langCode) {
        if (!LanguageConfig.isLanguageSupported(langCode)) {
            console.warn(`语言 ${langCode} 不受支持，使用默认语言`);
            langCode = 'zh-CN';
        }

        this.currentLang = langCode;

        // 保存到本地存储
        localStorage.setItem('news-assistant-language', langCode);

        // 更新HTML lang属性
        document.documentElement.lang = langCode;

        // 应用翻译
        this.applyTranslations();

        // 更新语言选择器显示
        this.updateLanguageSelector();

        // 触发语言变更事件
        this.dispatchLanguageChangeEvent();

        console.log(`语言已切换为: ${LanguageConfig.getLanguageName(langCode)}`);
    }

    // 应用翻译到页面
    applyTranslations() {
        // 遍历所有带有data-i18n属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const value = getTranslation(this.currentLang, key);

            if (value !== undefined && value !== key) {
                element.textContent = value;
            }
        });

        // 处理placeholder属性
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const value = getTranslation(this.currentLang, key);

            if (value !== undefined) {
                element.placeholder = value;
            }
        });

        // 处理alt属性
        document.querySelectorAll('[data-i18n-alt]').forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            const value = getTranslation(this.currentLang, key);

            if (value !== undefined) {
                element.alt = value;
            }
        });

        // 处理title属性
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const value = getTranslation(this.currentLang, key);

            if (value !== undefined) {
                element.title = value;
            }
        });

        // 处理value属性
        document.querySelectorAll('[data-i18n-value]').forEach(element => {
            const key = element.getAttribute('data-i18n-value');
            const value = getTranslation(this.currentLang, key);

            if (value !== undefined) {
                element.value = value;
            }
        });
    }

    // 初始化语言选择器
    initLanguageSelector() {
        const languageBtn = document.getElementById('languageBtn');
        const languageDropdown = document.getElementById('languageDropdown');
        const languageList = document.getElementById('languageList');
        const languageSearch = document.getElementById('languageSearch');

        if (!languageBtn || !languageDropdown) return;

        // 切换下拉菜单显示
        languageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            languageDropdown.classList.toggle('show');

            // 如果正在显示，填充语言列表
            if (languageDropdown.classList.contains('show')) {
                this.populateLanguageList();
            }
        });

        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', () => {
            languageDropdown.classList.remove('show');
        });

        // 阻止下拉菜单内部点击事件冒泡
        languageDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // 搜索功能
        if (languageSearch) {
            languageSearch.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                this.filterLanguageList(searchTerm);
            });
        }
    }

    // 填充语言列表
    populateLanguageList() {
        const languageList = document.getElementById('languageList');
        if (!languageList) return;

        languageList.innerHTML = '';

        LanguageConfig.supportedLanguages.forEach(lang => {
            const langItem = document.createElement('div');
            langItem.className = 'language-option';
            langItem.dataset.lang = lang.code;

            // 创建国旗图标
            const flagUrl = LanguageConfig.getFlagPath(lang.code);
            const flagImg = document.createElement('img');
            flagImg.src = flagUrl;
            flagImg.alt = lang.name;
            flagImg.className = 'language-flag';

            const langInfo = document.createElement('div');
            langInfo.className = 'language-info';

            const langName = document.createElement('span');
            langName.className = 'lang-name';
            langName.textContent = lang.name;

            const langCodeSpan = document.createElement('span');
            langCodeSpan.className = 'lang-code';
            langCodeSpan.textContent = lang.code;

            langInfo.appendChild(langName);
            langInfo.appendChild(langCodeSpan);

            langItem.appendChild(flagImg);
            langItem.appendChild(langInfo);

            // 标记当前语言
            if (lang.code === this.currentLang) {
                langItem.classList.add('current');

                const checkIcon = document.createElement('i');
                checkIcon.className = 'fas fa-check';
                langItem.appendChild(checkIcon);
            }

            langItem.addEventListener('click', () => {
                this.applyLanguage(lang.code);
                document.getElementById('languageDropdown').classList.remove('show');
            });

            languageList.appendChild(langItem);
        });
    }

    // 过滤语言列表
    filterLanguageList(searchTerm) {
        const languageOptions = document.querySelectorAll('.language-option');

        languageOptions.forEach(option => {
            const langName = option.querySelector('.lang-name').textContent.toLowerCase();
            const langCode = option.querySelector('.lang-code').textContent.toLowerCase();

            if (langName.includes(searchTerm) || langCode.includes(searchTerm)) {
                option.style.display = 'flex';
            } else {
                option.style.display = 'none';
            }
        });
    }

    // 更新语言选择器显示
    updateLanguageSelector() {
        const currentLangSpan = document.getElementById('currentLang');
        if (currentLangSpan) {
            currentLangSpan.textContent = LanguageConfig.getLanguageName(this.currentLang);
        }

        // 更新当前语言的国旗图标
        const languageBtnFlag = document.querySelector('#languageBtn .language-flag');
        if (languageBtnFlag) {
            languageBtnFlag.src = LanguageConfig.getFlagPath(this.currentLang);
            languageBtnFlag.alt = LanguageConfig.getLanguageName(this.currentLang);
        }
    }

    // 触发语言变更事件
    dispatchLanguageChangeEvent() {
        const event = new CustomEvent('languageChange', {
            detail: { language: this.currentLang }
        });
        document.dispatchEvent(event);
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLang;
    }

    // 获取翻译文本
    getTranslation(key) {
        return getTranslation(this.currentLang, key);
    }
}

// 创建全局语言管理器实例
const languageManager = new StaticLanguageManager();