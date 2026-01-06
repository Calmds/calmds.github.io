// 环境检测工具
class EnvironmentDetector {
    static detectLanguagePreference() {
        const data = {
            browserLanguages: navigator.languages || [navigator.language || navigator.userLanguage || 'en'],
            preferredLanguage: '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            region: '',
            suggestions: []
        };

        // 分析浏览器语言
        console.group('🌍 Language Detection Analysis');
        console.log('Browser languages:', data.browserLanguages);
        console.log('Timezone:', data.timezone);

        // 语言偏好建议
        if (data.browserLanguages.some(lang => lang.startsWith('zh'))) {
            data.suggestions.push('Detected Chinese language preference');
            data.preferredLanguage = 'zh-CN';
        } else if (data.browserLanguages.some(lang => lang.startsWith('ja'))) {
            data.suggestions.push('Detected Japanese language preference');
            data.preferredLanguage = 'ja';
        } else if (data.browserLanguages.some(lang => lang.startsWith('ko'))) {
            data.suggestions.push('Detected Korean language preference');
            data.preferredLanguage = 'ko';
        } else {
            data.suggestions.push('Defaulting to English');
            data.preferredLanguage = 'en';
        }

        console.log('Suggested language:', data.preferredLanguage);
        console.log('Suggestions:', data.suggestions);
        console.groupEnd();

        return data;
    }
}

// 在控制台输出环境信息
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const envInfo = EnvironmentDetector.detectLanguagePreference();
        console.log('📊 Environment Info:', envInfo);
    }
});