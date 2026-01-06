// 语言配置 - 移除重复的name字段
const LANGUAGE_CONFIG = {
    supportedLanguages: [
        {
            code: 'zh-CN',
            name: '简体中文',
            flag: 'cn.jpg',
            dir: 'ltr'
        },
        {
            code: 'zh-MO',
            name: '繁體中文',
            flag: 'cn.jpg',
            dir: 'ltr'
        },
        {
            code: 'en',
            name: 'English',
            flag: 'en.jpg',
            dir: 'ltr'
        },
        {
            code: 'ja',
            name: '日本語',
            flag: 'jp.jpg',
            dir: 'ltr'
        },
        {
            code: 'ko',
            name: '한국어',
            flag: 'ko.jpg',
            dir: 'ltr'
        },
        {
            code: 'ru',
            name: 'Русский',
            flag: 'ru.jpg',
            dir: 'ltr'
        },
        {
            code: 'de',
            name: 'Deutsch',
            flag: 'de.jpg',
            dir: 'ltr'
        },
        {
            code: 'ar',
            name: 'العربية',
            flag: 'ar.jpg',
            dir: 'rtl'
        },
        {
            code: 'hi',
            name: 'हिन्दी',
            flag: 'in.jpg',
            dir: 'ltr'
        },
        {
            code: 'th',
            name: 'ไทย',
            flag: 'th.jpg',
            dir: 'ltr'
        },
        {
            code: 'vi',
            name: 'Tiếng Việt',
            flag: 'vi.jpg',
            dir: 'ltr'
        },
        {
            code: 'ms',
            name: 'Bahasa Melayu',
            flag: 'ms.jpg',
            dir: 'ltr'
        },
        {
            code: 'mn',
            name: 'Монгол',
            flag: 'mongolia.jpg',
            dir: 'ltr'
        },
        {
            code: 'ur',
            name: 'اردو',
            flag: 'ur.jpg',
            dir: 'rtl'
        }
    ],

    defaultLanguage: 'zh-CN',

    getLanguageName(code) {
        const lang = this.supportedLanguages.find(l => l.code === code);
        return lang ? lang.name : code;
    },

    getLanguageFlag(code) {
        const lang = this.supportedLanguages.find(l => l.code === code);
        return lang ? `assets/flags/${lang.flag}` : 'assets/flags/cn.jpg';
    },

    // 检测用户偏好的语言
    detectUserLanguage() {
        const storedLang = localStorage.getItem('language');
        if (storedLang) return storedLang;

        const browserLang = navigator.language || navigator.userLanguage;

        // 尝试匹配精确代码
        const exactMatch = this.supportedLanguages.find(l => l.code === browserLang);
        if (exactMatch) return browserLang;

        // 尝试匹配基础语言代码（如 zh-CN 匹配 zh-CN, zh-TW）
        const baseLang = browserLang.split('-')[0];
        const baseMatch = this.supportedLanguages.find(l => l.code.split('-')[0] === baseLang);
        if (baseMatch) return baseMatch.code;

        return this.defaultLanguage;
    }
};