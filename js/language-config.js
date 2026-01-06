// 语言配置
const LANGUAGE_CONFIG = {
    supportedLanguages: [
        {
            code: 'zh-CN',
            name: '简体中文',
            flag: 'cn.jpg',
            dir: 'ltr',
            nativeName: '简体中文'
        },
        {
            code: 'zh-MO',
            name: '繁體中文',
            flag: 'macau.jpg',
            dir: 'ltr',
            nativeName: '繁體中文'
        },
        {
            code: 'en',
            name: 'English',
            flag: 'en.jpg',
            dir: 'ltr',
            nativeName: 'English'
        },
        {
            code: 'ja',
            name: '日本語',
            flag: 'jp.jpg',
            dir: 'ltr',
            nativeName: '日本語'
        },
        {
            code: 'ko',
            name: '한국어',
            flag: 'ko.jpg',
            dir: 'ltr',
            nativeName: '한국어'
        },
        {
            code: 'ru',
            name: 'Русский',
            flag: 'ru.jpg',
            dir: 'ltr',
            nativeName: 'Русский'
        },
        {
            code: 'de',
            name: 'Deutsch',
            flag: 'de.jpg',
            dir: 'ltr',
            nativeName: 'Deutsch'
        },
        {
            code: 'ar',
            name: 'العربية',
            flag: 'ar.jpg',
            dir: 'rtl',
            nativeName: 'العربية'
        },
        {
            code: 'hi',
            name: 'हिन्दी',
            flag: 'in.jpg',
            dir: 'ltr',
            nativeName: 'हिन्दी'
        },
        {
            code: 'th',
            name: 'ไทย',
            flag: 'th.jpg',
            dir: 'ltr',
            nativeName: 'ไทย'
        },
        {
            code: 'vi',
            name: 'Tiếng Việt',
            flag: 'vi.jpg',
            dir: 'ltr',
            nativeName: 'Tiếng Việt'
        },
        {
            code: 'ms',
            name: 'Bahasa Melayu',
            flag: 'ms.jpg',
            dir: 'ltr',
            nativeName: 'Bahasa Melayu'
        },
        {
            code: 'mn',
            name: 'Монгол',
            flag: 'mongolia.jpg',
            dir: 'ltr',
            nativeName: 'Монгол'
        },
        {
            code: 'ur',
            name: 'اردو',
            flag: 'ur.jpg',
            dir: 'rtl',
            nativeName: 'اردو'
        }
    ],

    defaultLanguage: 'zh-CN',

    getLanguageName(code) {
        const lang = this.supportedLanguages.find(l => l.code === code);
        return lang ? lang.name : code;
    },

    getNativeName(code) {
        const lang = this.supportedLanguages.find(l => l.code === code);
        return lang ? lang.nativeName : code;
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