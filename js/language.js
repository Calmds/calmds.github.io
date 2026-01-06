// 语言管理器
class LanguageManager {
    constructor() {
        this.currentLang = 'zh-CN';
        this.translations = null;
        this.supportedLanguages = [];
        this.languageNames = {};

        // 初始化
        this.init();
    }

    // 初始化语言管理器
    async init() {
        // 从本地存储获取用户选择的语言
        const savedLang = localStorage.getItem('news-assistant-language');

        // 检测浏览器语言
        const browserLang = this.getBrowserLanguage();

        // 设置当前语言（优先使用保存的语言，其次是浏览器语言，最后是默认中文）
        if (savedLang && this.isLanguageSupported(savedLang)) {
            this.currentLang = savedLang;
        } else if (browserLang && this.isLanguageSupported(browserLang)) {
            this.currentLang = browserLang;
        } else {
            this.currentLang = 'zh-CN';
        }

        // 加载语言配置
        await this.loadLanguageConfig();

        // 应用当前语言
        await this.applyLanguage(this.currentLang);

        // 初始化语言选择器
        this.initLanguageSelector();
    }

    // 加载语言配置文件
    async loadLanguageConfig() {
        try {
            const response = await fetch('assets/languages/translations.json');
            const data = await response.json();

            this.supportedLanguages = data.supportedLanguages || [];
            this.languageNames = data.languageNames || {};
            this.translations = data.translations || {};

            console.log('语言配置文件加载成功');
        } catch (error) {
            console.error('加载语言配置文件失败:', error);
            // 设置默认值
            this.supportedLanguages = ['zh-CN', 'en'];
            this.languageNames = {
                'zh-CN': '简体中文',
                'en': 'English'
            };
            this.translations = {};
        }
    }

    // 获取浏览器语言
    getBrowserLanguage() {
        const lang = navigator.language || navigator.userLanguage;

        // 简化语言代码（例如：zh-CN -> zh-CN, en-US -> en）
        if (lang.includes('-')) {
            const parts = lang.split('-');
            // 对于中文，保留地区代码
            if (parts[0] === 'zh') {
                return lang;
            }
            return parts[0];
        }

        return lang;
    }

    // 检查语言是否受支持
    isLanguageSupported(langCode) {
        // 检查精确匹配
        if (this.supportedLanguages.includes(langCode)) {
            return true;
        }

        // 检查基础语言匹配（例如：zh-TW -> zh-CN）
        const baseLang = langCode.split('-')[0];
        return this.supportedLanguages.some(lang => lang.startsWith(baseLang));
    }

    // 应用语言
    async applyLanguage(langCode) {
        if (!this.isLanguageSupported(langCode)) {
            console.warn(`语言 ${langCode} 不受支持，使用默认语言`);
            langCode = 'zh-CN';
        }

        this.currentLang = langCode;

        // 保存到本地存储
        localStorage.setItem('news-assistant-language', langCode);

        // 更新HTML lang属性
        document.documentElement.lang = langCode;

        // 获取翻译文本
        const translations = this.translations[langCode] || this.translations['zh-CN'] || {};

        // 应用翻译
        this.applyTranslations(translations);

        // 更新语言选择器显示
        this.updateLanguageSelector();

        // 触发语言变更事件
        this.dispatchLanguageChangeEvent();

        console.log(`语言已切换为: ${this.languageNames[langCode] || langCode}`);
    }

    // 应用翻译到页面
    applyTranslations(translations) {
        // 遍历所有带有data-i18n属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const value = this.getNestedValue(translations, key);

            if (value !== undefined) {
                element.textContent = value;
            }
        });

        // 处理带有属性的翻译（如placeholder, alt, title等）
        document.querySelectorAll('[data-i18n-attr]').forEach(element => {
            const attr = element.getAttribute('data-i18n-attr');
            const key = element.getAttribute('data-i18n-key');
            const value = this.getNestedValue(translations, key);

            if (value !== undefined) {
                element.setAttribute(attr, value);
            }
        });

        // 处理复杂的翻译（多个属性）
        document.querySelectorAll('[data-i18n-complex]').forEach(element => {
            const config = JSON.parse(element.getAttribute('data-i18n-complex'));
            const value = this.getNestedValue(translations, config.key);

            if (value !== undefined) {
                if (config.attr) {
                    element.setAttribute(config.attr, value);
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    // 获取嵌套对象的值
    getNestedValue(obj, path) {
        if (!obj || !path) return undefined;

        const keys = path.split('.');
        let current = obj;

        for (const key of keys) {
            if (current[key] === undefined) {
                return undefined;
            }
            current = current[key];
        }

        return current;
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
        });

        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', () => {
            languageDropdown.classList.remove('show');
        });

        // 阻止下拉菜单内部点击事件冒泡
        languageDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // 填充语言列表
        this.populateLanguageList();

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

        this.supportedLanguages.forEach(langCode => {
            const langName = this.languageNames[langCode] || langCode;
            const langItem = document.createElement('div');
            langItem.className = 'language-option';
            langItem.dataset.lang = langCode;
            langItem.innerHTML = `
                <span class="lang-name">${langName}</span>
                <span class="lang-code">${langCode}</span>
            `;

            // 标记当前语言
            if (langCode === this.currentLang) {
                langItem.classList.add('current');
                langItem.innerHTML += '<i class="fas fa-check"></i>';
            }

            langItem.addEventListener('click', () => {
                this.applyLanguage(langCode);
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
            currentLangSpan.textContent = this.languageNames[this.currentLang] || this.currentLang;
        }

        // 重新填充语言列表（更新选中状态）
        this.populateLanguageList();
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
        const translations = this.translations[this.currentLang] || this.translations['zh-CN'] || {};
        return this.getNestedValue(translations, key) || key;
    }
}

// 创建全局语言管理器实例
const languageManager = new LanguageManager();