// 语言配置
const LANGUAGE_CONFIG = {
    supportedLanguages: [
        { code: 'zh-CN', name: '简体中文', flag: 'cn.jpg', dir: 'ltr' },
        { code: 'zh-MO', name: '繁體中文', flag: 'cn.jpg', dir: 'ltr' },
        { code: 'en', name: 'English', flag: 'en.jpg', dir: 'ltr' },
        { code: 'ja', name: '日本語', flag: 'jp.jpg', dir: 'ltr' },
        { code: 'ko', name: '한국어', flag: 'ko.jpg', dir: 'ltr' },
        { code: 'ru', name: 'Русский', flag: 'ru.jpg', dir: 'ltr' },
        { code: 'de', name: 'Deutsch', flag: 'de.jpg', dir: 'ltr' },
        { code: 'fr', name: 'Français', flag: 'fr.jpg', dir: 'ltr' },
        { code: 'ms', name: 'Bahasa Melayu', flag: 'ms.jpg', dir: 'ltr' },
        { code: 'id', name: 'Bahasa Indonesia', flag: 'id.jpg', dir: 'ltr' },
        { code: 'th', name: 'ไทย', flag: 'th.jpg', dir: 'ltr' },
        { code: 'vi', name: 'Tiếng Việt', flag: 'vi.jpg', dir: 'ltr' },
        { code: 'ar', name: 'العربية', flag: 'ar.jpg', dir: 'rtl' },
        { code: 'ur', name: 'اردو', flag: 'ur.jpg', dir: 'rtl' },
        { code: 'it', name: 'Italiano', flag: 'it.jpg', dir: 'ltr' },
        { code: 'pt', name: 'Português', flag: 'pt.jpg', dir: 'ltr' },
        { code: 'es', name: 'Español', flag: 'es.jpg', dir: 'ltr' },
        { code: 'my', name: 'မြန်မာစာ', flag: 'my.jpg', dir: 'ltr' },
        { code: 'km', name: 'ខ្មែរ', flag: 'km.jpg', dir: 'ltr' },
        { code: 'lo', name: 'ລາວ', flag: 'lo.jpg', dir: 'ltr' },
        { code: 'hi', name: 'हिन्दी', flag: 'in.jpg', dir: 'ltr' },
        { code: 'mn', name: 'Монгол', flag: 'mongolia.jpg', dir: 'ltr' },
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
        const matchingLang = this.supportedLanguages.find(l => l.code.split('-')[0] === baseLang);
        return !!matchingLang;
    },

    // 根据地理位置猜测语言
    guessLanguageByGeo() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            console.log('User timezone:', timezone);

            // 扩展时区映射以支持所有已配置语言
            const timezoneMap = {
                // 中文地区
                'Asia/Shanghai': 'zh-CN',
                'Asia/Chongqing': 'zh-CN',
                'Asia/Beijing': 'zh-CN',
                'Asia/Taipei': 'zh-MO',      // 台湾使用繁体中文
                'Asia/Hong_Kong': 'zh-MO',    // 香港使用繁体中文
                'Asia/Macau': 'zh-MO',        // 澳门使用繁体中文

                // 日语
                'Asia/Tokyo': 'ja',
                'Asia/Osaka': 'ja',
                'Asia/Nagoya': 'ja',

                // 韩语
                'Asia/Seoul': 'ko',
                'Asia/Pyongyang': 'ko',

                // 俄语
                'Europe/Moscow': 'ru',
                'Europe/Volgograd': 'ru',
                'Europe/Kaliningrad': 'ru',
                'Asia/Yekaterinburg': 'ru',
                'Asia/Novosibirsk': 'ru',

                // 德语
                'Europe/Berlin': 'de',
                'Europe/Vienna': 'de',     // 奥地利
                'Europe/Zurich': 'de',     // 瑞士德语区

                // 法语
                'Europe/Paris': 'fr',
                'Europe/Brussels': 'fr',   // 比利时法语区
                'Europe/Geneva': 'fr',     // 瑞士法语区
                'Africa/Algiers': 'fr',    // 阿尔及利亚
                'Africa/Casablanca': 'fr', // 摩洛哥

                // 泰语
                'Asia/Bangkok': 'th',

                // 越南语
                'Asia/Ho_Chi_Minh': 'vi',
                'Asia/Hanoi': 'vi',

                // 马来语
                'Asia/Kuala_Lumpur': 'ms',
                'Asia/Singapore': 'ms',    // 新加坡（部分使用马来语）

                // 阿拉伯语
                'Asia/Riyadh': 'ar',
                'Asia/Dubai': 'ar',
                'Asia/Doha': 'ar',
                'Asia/Kuwait': 'ar',
                'Asia/Baghdad': 'ar',
                'Asia/Tehran': 'ar',       // 伊朗
                'Africa/Cairo': 'ar',      // 埃及

                // 乌尔都语（巴基斯坦）
                'Asia/Karachi': 'ur',
                'Asia/Islamabad': 'ur',
                'Asia/Lahore': 'ur',

                // 意大利语
                'Europe/Rome': 'it',
                'Europe/Milan': 'it',

                // 葡萄牙语
                'Europe/Lisbon': 'pt',
                'Atlantic/Azores': 'pt',
                'America/Sao_Paulo': 'pt',  // 巴西葡萄牙语
                'America/Rio_de Janeiro': 'pt',

                // 西班牙语
                'Europe/Madrid': 'es',
                'Europe/Barcelona': 'es',
                'America/Mexico_City': 'es',
                'America/Bogota': 'es',
                'America/Buenos_Aires': 'es',
                'America/Santiago': 'es',

                // 印地语
                'Asia/Kolkata': 'hi',
                'Asia/Delhi': 'hi',
                'Asia/Mumbai': 'hi',

                // 蒙古语
                'Asia/Ulaanbaatar': 'mn',
                'Asia/Hovd': 'mn',

                // 缅甸语
                'Asia/Yangon': 'my',
                'Asia/Rangoon': 'my',

                // 柬埔寨语
                'Asia/Phnom_Penh': 'km',

                // 老挝语
                'Asia/Vientiane': 'lo',

                // 印尼语
                'Asia/Jakarta': 'id',
                'Asia/Bandung': 'id',
                'Asia/Surabaya': 'id',

                // 英语（作为默认回退）
                'Europe/London': 'en',
                'America/New_York': 'en',
                'America/Los_Angeles': 'en',
                'America/Chicago': 'en',
                'America/Toronto': 'en',
                'Australia/Sydney': 'en',
                'Australia/Melbourne': 'en',
                'Pacific/Auckland': 'en'
            };

            // 精确匹配时区
            if (timezoneMap[timezone]) {
                return timezoneMap[timezone];
            }

            // 模糊匹配时区区域
            for (const [tz, lang] of Object.entries(timezoneMap)) {
                if (timezone.includes(tz.split('/')[0])) {
                    return lang;
                }
            }
        } catch (error) {
            console.warn('Failed to guess language by geo:', error);
        }

        return null;
    },

    // 同样需要更新 getLocaleForLanguage 方法
    getLocaleForLanguage(code) {
        const localeMap = {
            'zh-CN': 'zh-CN',
            'zh-MO': 'zh-MO',
            'zh-TW': 'zh-TW',
            'en': 'en-US',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'ru': 'ru-RU',
            'de': 'de-DE',
            'fr': 'fr-FR',
            'th': 'th-TH',
            'vi': 'vi-VN',
            'ms': 'ms-MY',
            'ar': 'ar-SA',
            'ur': 'ur-PK',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'es': 'es-ES',
            'hi': 'hi-IN',
            'mn': 'mn-MN',
            'my': 'my-MM',
            'km': 'km-KH',
            'lo': 'lo-LA',
            'id': 'id-ID'
        };
        return localeMap[code] || code;
    },

    // 获取用户环境的最佳匹配语言
    getBestMatchLanguage(preferredCode) {
        // 精确匹配
        if (this.isLanguageSupported(preferredCode)) {
            return preferredCode;
        }

        // 基础语言匹配
        const baseLang = preferredCode.split('-')[0];
        const matchingLang = this.supportedLanguages.find(l => l.code.split('-')[0] === baseLang);
        if (matchingLang) {
            return matchingLang.code;
        }

        // 返回默认语言
        return this.defaultLanguage;
    },

    // 新增方法：获取语言方向
    getLanguageDir(code) {
        const lang = this.supportedLanguages.find(l => l.code === code);
        return lang ? lang.dir : 'ltr';
    },

    // 新增方法：获取所有支持的语言代码
    getSupportedLanguageCodes() {
        return this.supportedLanguages.map(lang => lang.code);
    },

    // 新增方法：根据代码获取语言对象
    getLanguageByCode(code) {
        return this.supportedLanguages.find(l => l.code === code);
    },

    // 新增方法：检查是否是RTL语言
    isRTL(code) {
        const lang = this.getLanguageByCode(code);
        return lang ? lang.dir === 'rtl' : false;
    },
};