// 多语言支持
class LanguageManager {
    constructor() {
        this.currentLang = LANGUAGE_CONFIG.detectUserLanguage();
        this.translations = {};
        this.initialized = false;
        this.loadingPromises = {};
    }

    async init() {
        if (this.initialized) return;

        try {
            // 加载当前语言的翻译文件
            await this.loadLanguage(this.currentLang);
            this.initialized = true;
            this.updatePageLanguage();
            this.setupLanguageSelector();

            // 预加载用户可能使用的其他语言
            this.preloadLikelyLanguages();
        } catch (error) {
            console.error('Failed to load language:', error);
            // 尝试加载默认语言
            if (this.currentLang !== LANGUAGE_CONFIG.defaultLanguage) {
                this.currentLang = LANGUAGE_CONFIG.defaultLanguage;
                await this.init();
            }
        }
    }

    async loadLanguage(langCode) {
        // 如果正在加载中，返回Promise
        if (this.loadingPromises[langCode]) {
            return this.loadingPromises[langCode];
        }

        const loadPromise = (async () => {
            try {
                const response = await fetch(`assets/languages/${langCode}.json`);
                if (!response.ok) {
                    throw new Error(`Language file not found: ${langCode}`);
                }

                this.translations = await response.json();
                localStorage.setItem('language', langCode);
                this.currentLang = langCode;

                // 发送语言变化事件
                this.dispatchLanguageChange();
            } catch (error) {
                console.warn(`Failed to load language ${langCode}:`, error);
                // 如果当前语言加载失败，尝试加载默认语言
                if (langCode !== LANGUAGE_CONFIG.defaultLanguage) {
                    return this.loadLanguage(LANGUAGE_CONFIG.defaultLanguage);
                }
                throw error;
            }
        })();

        this.loadingPromises[langCode] = loadPromise;
        return loadPromise;
    }

    async preloadLikelyLanguages() {
        // 预加载用户浏览器语言和其他常用语言
        const languagesToPreload = [
            'en',
            'zh-TW',
            'ja',
            'ko'
        ].filter(lang => lang !== this.currentLang);

        languagesToPreload.forEach(lang => {
            this.loadLanguage(lang).catch(() => {
                // 静默失败，不影响用户体验
            });
        });
    }

    translate(key, params = {}) {
        if (!this.translations) {
            console.warn('Translations not loaded');
            return key;
        }

        let translation = this.translations;
        const keys = key.split('.');

        for (const k of keys) {
            if (translation && typeof translation === 'object' && k in translation) {
                translation = translation[k];
            } else {
                // 如果找不到翻译，尝试从父级语言获取
                if (this.currentLang.includes('-')) {
                    const baseLang = this.currentLang.split('-')[0];
                    if (baseLang !== this.currentLang) {
                        // 尝试加载基础语言
                        this.loadLanguage(baseLang).catch(() => { });
                        return key;
                    }
                }
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        // 替换参数
        if (typeof translation === 'string') {
            Object.keys(params).forEach(param => {
                const regex = new RegExp(`\\{${param}\\}`, 'g');
                translation = translation.replace(regex, params[param]);
            });
        }

        return translation;
    }

    updatePageLanguage() {
        // 更新页面语言属性
        document.documentElement.lang = this.currentLang;

        // 更新文本方向
        const langConfig = LANGUAGE_CONFIG.supportedLanguages.find(l => l.code === this.currentLang);
        if (langConfig) {
            document.documentElement.dir = langConfig.dir;
        }

        // 翻译所有带有 data-i18n 属性的元素
        this.translateAllElements();

        // 更新页面标题
        this.updatePageTitle();
    }

    translateAllElements() {
        // 一次性获取所有需要翻译的元素
        const elements = document.querySelectorAll('[data-i18n]');

        elements.forEach(element => {
            this.translateElement(element);
        });

        // 处理带有data-i18n-placeholder属性的输入框
        const inputElements = document.querySelectorAll('[data-i18n-placeholder]');
        inputElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.translate(key);
            element.placeholder = translation;
        });

        // 处理带有data-i18n-alt属性的图片
        const imgElements = document.querySelectorAll('[data-i18n-alt]');
        imgElements.forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            const translation = this.translate(key);
            element.alt = translation;
        });
    }

    translateElement(element) {
        const key = element.getAttribute('data-i18n');
        const translation = this.translate(key);

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.type !== 'submit' && element.type !== 'button') {
                element.placeholder = translation;
            } else {
                element.value = translation;
            }
        } else if (element.hasAttribute('data-i18n-html')) {
            element.innerHTML = translation;
        } else {
            element.textContent = translation;
        }
    }

    updatePageTitle() {
        const appName = this.translate('app_name');
        const pageTitleKey = document.title;

        // 获取当前页面的标题
        const path = window.location.pathname;
        let pageKey = 'home.title';

        if (path.includes('features')) {
            pageKey = 'features.title';
        } else if (path.includes('download')) {
            pageKey = 'download.title';
        } else if (path.includes('history')) {
            pageKey = 'history.title';
        }

        const pageTitle = this.translate(pageKey);
        document.title = `${appName} - ${pageTitle}`;
    }

    updateLanguageSelector() {
        const currentLangBtn = document.querySelector('#currentLang');
        const currentLangFlag = document.querySelector('.language-flag');

        if (currentLangBtn) {
            currentLangBtn.textContent = LANGUAGE_CONFIG.getNativeName(this.currentLang);
        }

        if (currentLangFlag) {
            currentLangFlag.src = LANGUAGE_CONFIG.getLanguageFlag(this.currentLang);
            currentLangFlag.alt = LANGUAGE_CONFIG.getLanguageName(this.currentLang);
        }
    }

    setupLanguageSelector() {
        const languageList = document.getElementById('languageList');
        if (!languageList) return;

        // 清空现有选项
        languageList.innerHTML = '';

        // 添加语言选项
        LANGUAGE_CONFIG.supportedLanguages.forEach(lang => {
            const item = document.createElement('div');
            item.className = `language-item ${lang.code === this.currentLang ? 'active' : ''}`;
            item.dataset.lang = lang.code;
            item.dataset.dir = lang.dir;

            item.innerHTML = `
                <img src="assets/flags/${lang.flag}" alt="${lang.name}" class="language-flag">
                <span class="language-name">${lang.nativeName}</span>
                <span class="language-name-en">${lang.name}</span>
            `;

            item.addEventListener('click', () => this.changeLanguage(lang.code));
            languageList.appendChild(item);
        });

        // 设置搜索功能
        const searchInput = document.getElementById('languageSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const items = languageList.querySelectorAll('.language-item');

                items.forEach(item => {
                    const name = item.querySelector('.language-name').textContent.toLowerCase();
                    const nameEn = item.querySelector('.language-name-en').textContent.toLowerCase();
                    const langCode = item.dataset.lang.toLowerCase();

                    const matches = name.includes(searchTerm) ||
                        nameEn.includes(searchTerm) ||
                        langCode.includes(searchTerm);

                    item.style.display = matches ? 'flex' : 'none';
                });
            });
        }
    }

    async changeLanguage(langCode) {
        if (langCode === this.currentLang) return;

        try {
            await this.loadLanguage(langCode);
            this.updatePageLanguage();
            this.updateLanguageSelector();

            // 关闭语言选择器
            const dropdown = document.querySelector('.language-dropdown');
            if (dropdown) dropdown.classList.remove('show');

            // 显示成功消息
            if (window.common) {
                window.common.showToast(
                    `${LANGUAGE_CONFIG.getNativeName(langCode)} ${this.translate('language.changed')}`,
                    'success'
                );
            }
        } catch (error) {
            console.error('Failed to change language:', error);
            if (window.common) {
                window.common.showToast(
                    this.translate('language.change_failed'),
                    'error'
                );
            }
        }
    }

    dispatchLanguageChange() {
        const event = new CustomEvent('languageChange', {
            detail: { language: this.currentLang }
        });
        window.dispatchEvent(event);
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLang;
    }

    // 获取所有支持的语言
    getSupportedLanguages() {
        return LANGUAGE_CONFIG.supportedLanguages;
    }

    // 为动态内容提供翻译功能
    t(key, params = {}) {
        return this.translate(key, params);
    }
}

// 初始化语言管理器
document.addEventListener('DOMContentLoaded', async () => {
    // 确保只初始化一次
    if (!window.languageManager) {
        window.languageManager = new LanguageManager();
        window.i18n = window.languageManager; // 提供短别名
        await window.languageManager.init();
    }
});