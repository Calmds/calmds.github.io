// 多语言支持
class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') ||
            navigator.language ||
            LANGUAGE_CONFIG.defaultLanguage;
        this.translations = {};
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // 加载当前语言的翻译文件
            await this.loadLanguage(this.currentLang);
            this.initialized = true;
            this.updatePageLanguage();
            this.setupLanguageSelector();
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
        try {
            const response = await fetch(`assets/languages/${langCode}.json`);
            if (!response.ok) throw new Error('Language file not found');

            this.translations = await response.json();
            localStorage.setItem('language', langCode);
            this.currentLang = langCode;
        } catch (error) {
            console.warn(`Failed to load language ${langCode}:`, error);
            throw error;
        }
    }

    translate(key, params = {}) {
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
                translation = translation.replace(`{${param}}`, params[param]);
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
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.hasAttribute('data-i18n-attr')) {
                const attr = element.getAttribute('data-i18n-attr');
                element.setAttribute(attr, translation);
            } else {
                element.textContent = translation;
            }
        });

        // 更新语言选择器显示
        this.updateLanguageSelector();
    }

    updateLanguageSelector() {
        const currentLangBtn = document.querySelector('#currentLang');
        const currentLangFlag = document.querySelector('.language-flag');

        if (currentLangBtn) {
            currentLangBtn.textContent = LANGUAGE_CONFIG.getLanguageName(this.currentLang);
        }

        if (currentLangFlag) {
            currentLangFlag.src = LANGUAGE_CONFIG.getLanguageFlag(this.currentLang);
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

            item.innerHTML = `
                <img src="assets/flags/${lang.flag}" alt="${lang.name}" class="language-flag">
                <span>${lang.name}</span>
            `;

            item.addEventListener('click', () => this.changeLanguage(lang.code));
            languageList.appendChild(item);
        });

        // 设置搜索功能
        const searchInput = document.getElementById('languageSearch');
        if (searchInput) {
            searchInput.placeholder = this.translate('language.search_placeholder');
        }
    }

    async changeLanguage(langCode) {
        if (langCode === this.currentLang) return;

        try {
            await this.loadLanguage(langCode);
            this.updatePageLanguage();

            // 关闭语言选择器
            const dropdown = document.querySelector('.language-dropdown');
            if (dropdown) dropdown.classList.remove('show');

            // 显示成功消息
            if (window.common) {
                window.common.showToast(
                    `${LANGUAGE_CONFIG.getLanguageName(langCode)} ${this.translate('language.changed')}`,
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

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLang;
    }

    // 获取所有支持的语言
    getSupportedLanguages() {
        return LANGUAGE_CONFIG.supportedLanguages;
    }
}

// 初始化语言管理器
document.addEventListener('DOMContentLoaded', async () => {
    window.languageManager = new LanguageManager();
    await window.languageManager.init();
});