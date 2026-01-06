// 语言配置
const LANGUAGE_CONFIG = {
    supportedLanguages: [
        {
            code: 'zh-CN',
            name: '简体中文',
            flag: 'cn.jpg',
            dir: 'ltr'
        },
        {
            code: 'zh-TW',
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

    // 默认使用英文
    defaultLanguage: 'en',

    getLanguageName(code) {
        const lang = this.supportedLanguages.find(l => l.code === code);
        return lang ? lang.name : code;
    },

    getLanguageFlag(code) {
        const lang = this.supportedLanguages.find(l => l.code === code);
        return lang ? `assets/flags/${lang.flag}` : 'assets/flags/en.jpg';
    },

    // 智能检测用户语言偏好
    detectUserLanguage() {
        console.log('Detecting user language preference...');

        // 1. 首先检查本地存储
        const storedLang = localStorage.getItem('language');
        if (storedLang && this.isLanguageSupported(storedLang)) {
            console.log('Using stored language:', storedLang);
            return storedLang;
        }

        // 2. 检查浏览器语言
        const browserLanguages = navigator.languages || [navigator.language || navigator.userLanguage || 'en'];
        console.log('Browser languages:', browserLanguages);

        // 按优先级检测支持的语言
        for (const browserLang of browserLanguages) {
            // 尝试精确匹配
            if (this.isLanguageSupported(browserLang)) {
                console.log('Exact match found:', browserLang);
                return browserLang;
            }

            // 尝试基础语言匹配（如 zh-CN 匹配 zh）
            const baseLang = browserLang.split('-')[0].split('_')[0];
            if (baseLang && baseLang !== browserLang && this.isLanguageSupported(baseLang)) {
                console.log('Base language match found:', baseLang);
                return baseLang;
            }
        }

        // 3. 根据地理位置推测语言
        const geoLang = this.guessLanguageByGeo();
        if (geoLang && this.isLanguageSupported(geoLang)) {
            console.log('Geo-based language:', geoLang);
            return geoLang;
        }

        // 4. 默认使用英文
        console.log('Using default language: en');
        return this.defaultLanguage;
    },

    // 检查语言是否支持
    isLanguageSupported(langCode) {
        // 检查精确匹配
        if (this.supportedLanguages.find(l => l.code === langCode)) {
            return true;
        }

        // 检查基础语言匹配
        const baseLang = langCode.split('-')[0];
        return !!this.supportedLanguages.find(l => l.code.startsWith(baseLang));
    },

    // 根据地理位置猜测语言
    guessLanguageByGeo() {
        // 这里可以根据时区、用户代理等信息猜测
        // 返回最可能的主要语言
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (timezone.includes('Asia/Shanghai') || timezone.includes('Asia/Taipei')) {
            return 'zh-CN';
        } else if (timezone.includes('Asia/Tokyo')) {
            return 'ja';
        } else if (timezone.includes('Asia/Seoul')) {
            return 'ko';
        } else if (timezone.includes('Europe/')) {
            // 欧洲主要语言优先级
            if (timezone.includes('Europe/Berlin')) return 'de';
            if (timezone.includes('Europe/Moscow')) return 'ru';
            if (timezone.includes('Europe/Paris') || timezone.includes('Europe/London')) return 'en';
        } else if (timezone.includes('America/')) {
            // 美洲主要使用英文或西班牙文
            return 'en';
        }

        return null;
    },

    // 获取用户环境的最佳匹配语言
    getBestMatchLanguage(preferredCode) {
        // 精确匹配
        if (this.isLanguageSupported(preferredCode)) {
            return preferredCode;
        }

        // 基础语言匹配
        const baseLang = preferredCode.split('-')[0];
        const matchingLang = this.supportedLanguages.find(l => l.code.startsWith(baseLang));
        if (matchingLang) {
            return matchingLang.code;
        }

        // 返回默认语言
        return this.defaultLanguage;
    }
};