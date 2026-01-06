// 翻译工具函数
class TranslationHelper {
    constructor() {
        this.fallbackTranslations = {
            'zh-CN': {
                'app_name': '新闻助手',
                'nav.home': '首页',
                'nav.features': '功能特性',
                'nav.download': '下载',
                'nav.history': '历史版本'
            },
            'en': {
                'app_name': 'News Assistant',
                'nav.home': 'Home',
                'nav.features': 'Features',
                'nav.download': 'Download',
                'nav.history': 'History'
            }
        };
    }

    // 提供后备翻译，防止网络错误
    getFallbackTranslation(langCode, key) {
        const fallback = this.fallbackTranslations[langCode];
        if (fallback && fallback[key]) {
            return fallback[key];
        }

        // 如果特定语言没有，尝试英语
        if (langCode !== 'en') {
            const englishFallback = this.fallbackTranslations['en'];
            if (englishFallback && englishFallback[key]) {
                return englishFallback[key];
            }
        }

        return key;
    }

    // 格式化翻译键
    formatKey(keys) {
        if (Array.isArray(keys)) {
            return keys.join('.');
        }
        return keys;
    }

    // 批量翻译
    batchTranslate(keys, langCode) {
        const translations = {};
        keys.forEach(key => {
            translations[key] = this.getFallbackTranslation(langCode, key);
        });
        return translations;
    }
}

// 导出工具类
window.TranslationHelper = TranslationHelper;