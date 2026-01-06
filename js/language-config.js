// 多语言配置 - 纯静态版本
const LanguageConfig = {
    // 支持的语言列表
    supportedLanguages: [
        { code: 'zh-CN', name: '简体中文', flag: 'cn.jpg' },
        { code: 'zh-TW', name: '繁體中文', flag: 'cn.jpg' },
        { code: 'en', name: 'English', flag: 'en.jpg' },
        { code: 'fr', name: 'Français', flag: 'fr.jpg' },
        { code: 'de', name: 'Deutsch', flag: 'de.jpg' },
        { code: 'es', name: 'Español', flag: 'es.jpg' },
        { code: 'ja', name: '日本語', flag: 'jp.jpg' },
        { code: 'ko', name: '한국어', flag: 'ko.jpg' },
        { code: 'ru', name: 'Русский', flag: 'ru.jpg' },
        { code: 'ar', name: 'العربية', flag: 'ar.jpg' },
        { code: 'hi', name: 'हिन्दी', flag: 'in.jpg' },
        { code: 'vi', name: 'Tiếng Việt', flag: 'vi.jpg' },
        { code: 'th', name: 'ไทย', flag: 'th.jpg' },
        { code: 'ms', name: 'Bahasa Melayu', flag: 'ms.jpg' },
        { code: 'pt', name: 'Português', flag: 'pt.jpg' },
        { code: 'ur', name: 'اردو', flag: 'ur.jpg' }
    ],

    // 语言映射（处理特殊情况）
    languageMap: {
        'zh': 'zh-CN',
        'zh-Hans': 'zh-CN',
        'zh-Hans-CN': 'zh-CN',
        'zh-Hant': 'zh-TW',
        'zh-Hant-TW': 'zh-TW',
        'zh-Hant-HK': 'zh-TW',
        'en-US': 'en',
        'en-GB': 'en',
        'en-AU': 'en',
        'es-ES': 'es',
        'es-MX': 'es',
        'fr-FR': 'fr',
        'fr-CA': 'fr',
        'de-DE': 'de',
        'de-AT': 'de',
        'de-CH': 'de',
        'ja-JP': 'ja',
        'ko-KR': 'ko',
        'ru-RU': 'ru',
        'ar-SA': 'ar',
        'ar-AE': 'ar',
        'hi-IN': 'hi',
        'vi-VN': 'vi',
        'th-TH': 'th',
        'ms-MY': 'ms',
        'pt-BR': 'pt',
        'pt-PT': 'pt',
        'ur-PK': 'ur'
    },

    // 获取国旗图片路径
    getFlagPath: function (langCode) {
        const lang = this.supportedLanguages.find(l => l.code === langCode);
        if (lang && lang.flag) {
            return `assets/flags/${lang.flag}`;
        }
        return 'assets/flags/en.jpg'; // 默认国旗
    },

    // 获取语言显示名称
    getLanguageName: function (langCode) {
        const lang = this.supportedLanguages.find(l => l.code === langCode);
        return lang ? lang.name : langCode;
    },

    // 标准化语言代码
    normalizeLanguageCode: function (langCode) {
        // 如果已经在映射表中，直接返回
        if (this.languageMap[langCode]) {
            return this.languageMap[langCode];
        }

        // 提取基础语言代码
        const baseLang = langCode.split('-')[0];

        // 检查是否支持基础语言
        const supported = this.supportedLanguages.find(l => l.code.startsWith(baseLang));
        if (supported) {
            return supported.code;
        }

        // 默认返回英语
        return 'en';
    },

    // 检查是否支持该语言
    isLanguageSupported: function (langCode) {
        return this.supportedLanguages.some(lang => lang.code === langCode);
    },

    // 获取浏览器语言
    getBrowserLanguage: function () {
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        return this.normalizeLanguageCode(browserLang);
    },

    // 初始化默认语言
    initDefaultLanguage: function () {
        // 从本地存储获取用户选择的语言
        const savedLang = localStorage.getItem('news-assistant-language');

        if (savedLang && this.isLanguageSupported(savedLang)) {
            return savedLang;
        }

        // 使用浏览器语言
        const browserLang = this.getBrowserLanguage();
        if (this.isLanguageSupported(browserLang)) {
            return browserLang;
        }

        // 默认使用英语
        return 'en';
    }
};