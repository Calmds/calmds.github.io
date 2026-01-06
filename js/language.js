// 多语言支持
class LanguageManager {
    constructor() {
        console.log('Initializing LanguageManager...');
        this.currentLang = this.getInitialLanguage();
        this.translations = {};
        this.initialized = false;
        this.loadingPromises = {};
    }

    getInitialLanguage() {
        // 检测用户语言偏好
        const detectedLang = LANGUAGE_CONFIG.detectUserLanguage();
        console.log('Detected language:', detectedLang);
        return detectedLang;
    }

    async init() {
        if (this.initialized) return;

        console.log('Starting language initialization...');
        try {
            // 加载当前语言的翻译文件
            await this.loadLanguage(this.currentLang);
            this.initialized = true;

            // 立即更新页面
            this.updatePageLanguage();
            this.setupLanguageSelector();

            console.log('Language initialization completed:', this.currentLang);
        } catch (error) {
            console.error('Failed to initialize language:', error);

            // 如果当前语言加载失败，尝试加载英文
            if (this.currentLang !== 'en') {
                console.log('Falling back to English...');
                this.currentLang = 'en';
                await this.init();
            }
        }
    }

    async loadLanguage(langCode) {
        console.log('Loading language:', langCode);

        // 如果正在加载中，返回Promise
        if (this.loadingPromises[langCode]) {
            console.log('Language already loading, returning promise');
            return this.loadingPromises[langCode];
        }

        const loadPromise = (async () => {
            try {
                const response = await fetch(`assets/languages/${langCode}.json`);

                if (!response.ok) {
                    // 如果找不到具体的语言文件，尝试基础语言
                    if (langCode.includes('-')) {
                        const baseLang = langCode.split('-')[0];
                        console.log(`Trying base language: ${baseLang}`);
                        const baseResponse = await fetch(`assets/languages/${baseLang}.json`);

                        if (baseResponse.ok) {
                            this.translations = await baseResponse.json();
                            localStorage.setItem('language', baseLang);
                            this.currentLang = baseLang;
                            console.log(`Loaded base language: ${baseLang}`);
                            this.dispatchLanguageChange();
                            return;
                        }
                    }

                    throw new Error(`Language file not found: ${langCode}`);
                }

                this.translations = await response.json();
                localStorage.setItem('language', langCode);
                this.currentLang = langCode;

                console.log(`Successfully loaded language: ${langCode}`);

                // 发送语言变化事件
                this.dispatchLanguageChange();

            } catch (error) {
                console.warn(`Failed to load language ${langCode}:`, error);

                // 如果当前语言加载失败，抛出错误让上层处理
                throw error;
            }
        })();

        this.loadingPromises[langCode] = loadPromise;
        return loadPromise;
    }

    translate(key, params = {}) {
        if (!this.translations) {
            console.warn('Translations not loaded yet for key:', key);
            return key;
        }

        let translation = this.translations;
        const keys = key.split('.');

        for (const k of keys) {
            if (translation && typeof translation === 'object' && k in translation) {
                translation = translation[k];
            } else {
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
        console.log('Updating page language to:', this.currentLang);

        // 更新页面语言属性
        document.documentElement.lang = this.currentLang;

        // 更新文本方向
        const langConfig = LANGUAGE_CONFIG.supportedLanguages.find(l => l.code === this.currentLang);
        if (langConfig) {
            document.documentElement.dir = langConfig.dir;
        }

        // 立即更新语言选择器显示
        this.updateLanguageSelector();

        // 翻译所有带有 data-i18n 属性的元素
        this.translateAllElements();

        // 更新页面标题
        this.updatePageTitle();
    }

    translateAllElements() {
        console.log('Translating all elements...');

        // 一次性获取所有需要翻译的元素
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`Found ${elements.length} elements to translate`);

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

        console.log('Translation completed');
    }

    translateElement(element) {
        const key = element.getAttribute('data-i18n');

        // 跳过语言按钮，因为它已经在 updateLanguageSelector 中处理了
        if (element.id === 'currentLang') {
            return;
        }

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
        const currentLangFlag = document.querySelector('.language-btn .language-flag');

        if (currentLangBtn) {
            // 确保移除 data-i18n 属性，防止被翻译系统覆盖
            currentLangBtn.removeAttribute('data-i18n');
            const langName = LANGUAGE_CONFIG.getLanguageName(this.currentLang);
            currentLangBtn.textContent = langName;
            console.log('Updated language button to:', langName);
        }

        if (currentLangFlag) {
            const flagPath = LANGUAGE_CONFIG.getLanguageFlag(this.currentLang);
            currentLangFlag.src = flagPath;
            currentLangFlag.alt = LANGUAGE_CONFIG.getLanguageName(this.currentLang);
            console.log('Updated language flag to:', flagPath);
        }
    }

    setupLanguageSelector() {
        const languageList = document.getElementById('languageList');
        if (!languageList) {
            console.warn('Language list element not found');
            return;
        }

        console.log('Setting up language selector...');

        // 清空现有选项
        languageList.innerHTML = '';

        // 添加语言选项
        LANGUAGE_CONFIG.supportedLanguages.forEach(lang => {
            const item = document.createElement('div');
            item.className = `language-item ${lang.code === this.currentLang ? 'active' : ''}`;
            item.dataset.lang = lang.code;

            item.innerHTML = `
                <img src="assets/flags/${lang.flag}" alt="${lang.name}" class="language-flag">
                <span class="language-name">${lang.name}</span>
            `;

            item.addEventListener('click', () => this.changeLanguage(lang.code));
            languageList.appendChild(item);
        });

        console.log('Language selector setup completed');
    }

    async changeLanguage(langCode) {
        console.log('Changing language to:', langCode);

        if (langCode === this.currentLang) {
            console.log('Same language, skipping');
            return;
        }

        try {
            // 关闭语言下拉框
            const dropdown = document.querySelector('.language-dropdown');
            if (dropdown) dropdown.classList.remove('show');

            // 显示加载状态
            if (window.common) {
                window.common.showToast('切换语言中...', 'info');
            }

            // 加载新语言
            await this.loadLanguage(langCode);

            // 更新页面内容
            this.updatePageLanguage();

            // 更新下拉框选中状态
            this.updateDropdownSelection(langCode);

            // 显示成功消息（使用新语言）
            if (window.common) {
                const message = this.translate('language.changed');
                window.common.showToast(`${LANGUAGE_CONFIG.getLanguageName(langCode)} ${message}`, 'success');
            }

            console.log('Language changed successfully to:', langCode);
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

    updateDropdownSelection(langCode) {
        const languageList = document.getElementById('languageList');
        if (!languageList) return;

        // 移除所有active类
        languageList.querySelectorAll('.language-item').forEach(item => {
            item.classList.remove('active');
        });

        // 添加当前语言的active类
        const currentItem = languageList.querySelector(`[data-lang="${langCode}"]`);
        if (currentItem) {
            currentItem.classList.add('active');
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

    // 为动态内容提供翻译功能
    t(key, params = {}) {
        return this.translate(key, params);
    }
}

// 初始化语言管理器
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing language manager...');

    // 确保只初始化一次
    if (!window.languageManager) {
        window.languageManager = new LanguageManager();
        window.i18n = window.languageManager;

        try {
            await window.languageManager.init();
            console.log('Language manager initialization completed successfully');
        } catch (error) {
            console.error('Failed to initialize language manager:', error);
        }
    }
});