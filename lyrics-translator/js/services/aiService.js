/**
 * AI 服务工具类
 * 提供歌词翻译功能，支持多种翻译服务
 */
class AIService {
    /**
     * 初始化 AI 服务
     * @param {Object} config - 配置参数
     * @param {string} config.apiKey - API 密钥
     * @param {string} config.service - 翻译服务类型
     * @param {string} config.apiUrl - API 地址
     * @param {string} config.model - AI 模型名称
     */
    constructor(config = {}) {
        this.config = {
            service: config.service || 'mock',
            apiKey: config.apiKey || '',
            apiUrl: config.apiUrl || '',
            model: config.model || 'gpt-3.5-turbo',
            ...config
        };

        // 初始化翻译服务配置
        this.services = {
            // 模拟翻译（非AI）
            mock: {
                name: '模拟翻译',
                requiresKey: false,
                isAI: false,
                translate: this.mockTranslate.bind(this)
            },
            // AI翻译服务
            openai: {
                name: 'OpenAI API',
                requiresKey: true,
                isAI: true,
                translate: this.translateWithOpenAI.bind(this)
            },
            deepl: {
                name: 'DeepL API',
                requiresKey: true,
                isAI: true,
                translate: this.translateWithDeepL.bind(this)
            },
            google: {
                name: 'Google Translate API',
                requiresKey: true,
                isAI: true,
                translate: this.translateWithGoogle.bind(this)
            },
            // 国内AI翻译服务
            baidu_ai: {
                name: '百度AI翻译',
                requiresKey: true,
                isAI: true,
                translate: this.translateWithBaiduAI.bind(this)
            },
            youdao_ai: {
                name: '有道AI翻译',
                requiresKey: true,
                isAI: true,
                translate: this.translateWithYoudaoAI.bind(this)
            },
            // 国内非AI翻译服务
            baidu: {
                name: '百度翻译',
                requiresKey: true,
                isAI: false,
                translate: this.translateWithBaidu.bind(this)
            },
            youdao: {
                name: '有道翻译',
                requiresKey: true,
                isAI: false,
                translate: this.translateWithYoudao.bind(this)
            }
        };
    }

    /**
     * 切换翻译服务
     * @param {string} service - 翻译服务类型
     * @param {string} apiKey - API 密钥
     */
    switchService(service, apiKey = '') {
        this.config.service = service;
        this.config.apiKey = apiKey;
    }

    /**
     * 翻译歌词文本
     * @param {string} text - 要翻译的文本
     * @param {string} targetLang - 目标语言
     * @param {string} sourceLang - 源语言（可选，默认自动检测）
     * @returns {Promise<string>} - 翻译后的文本
     */
    async translate(text, targetLang, sourceLang = 'auto') {
        const service = this.services[this.config.service];
        
        try {
            // 检查服务是否需要密钥
            if (service.requiresKey && !this.config.apiKey) {
                throw new Error('缺少API密钥');
            }
            
            // 调用对应的翻译方法
            return await service.translate(text, targetLang, sourceLang);
        } catch (error) {
            console.error(`${service.name} 翻译失败:`, error);
            // 失败时返回模拟翻译结果
            return this.mockTranslate(text, targetLang);
        }
    }

    /**
     * 使用 OpenAI API 进行翻译
     * @param {string} text - 要翻译的文本
     * @param {string} targetLang - 目标语言
     * @param {string} sourceLang - 源语言
     * @returns {Promise<string>} - 翻译后的文本
     */
    async translateWithOpenAI(text, targetLang, sourceLang = 'auto') {
        const apiUrl = this.config.apiUrl || 'https://api.openai.com/v1/chat/completions';
        
        const prompt = `你是一个专业的歌词翻译家。请将以下歌词从${sourceLang === 'auto' ? '自动检测的语言' : sourceLang}翻译成${targetLang}。\n\n注意事项：\n1. 保持原歌词的韵律和意境\n2. 保留原有的格式和结构\n3. 翻译要自然流畅，符合目标语言的表达习惯\n4. 不要添加任何解释或额外内容\n5. 仅返回翻译后的歌词文本\n\n歌词内容：\n${text}`;

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [
                    { role: 'system', content: '你是一个专业的歌词翻译家，擅长翻译各种语言的歌词。' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2048
            })
        };

        const response = await fetch(apiUrl, requestOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'OpenAI API 请求失败');
        }

        return data.choices[0].message.content.trim();
    }

    /**
     * 使用 DeepL API 进行翻译
     * @param {string} text - 要翻译的文本
     * @param {string} targetLang - 目标语言
     * @param {string} sourceLang - 源语言
     * @returns {Promise<string>} - 翻译后的文本
     */
    async translateWithDeepL(text, targetLang, sourceLang = 'auto') {
        const apiUrl = this.config.apiUrl || 'https://api-free.deepl.com/v2/translate';
        
        // DeepL 语言代码映射
        const langMap = {
            'zh-CN': 'zh',
            'auto': 'auto'
        };
        
        const source = langMap[sourceLang] || sourceLang;
        const target = langMap[targetLang] || targetLang;

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `DeepL-Auth-Key ${this.config.apiKey}`
            },
            body: new URLSearchParams({
                text: text,
                source_lang: source === 'auto' ? '' : source.toUpperCase(),
                target_lang: target.toUpperCase(),
                preserve_formatting: '1'
            })
        };

        const response = await fetch(apiUrl, requestOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'DeepL API 请求失败');
        }

        return data.translations[0].text;
    }

    /**
     * 使用 Google Translate API 进行翻译
     * @param {string} text - 要翻译的文本
     * @param {string} targetLang - 目标语言
     * @param {string} sourceLang - 源语言
     * @returns {Promise<string>} - 翻译后的文本
     */
    async translateWithGoogle(text, targetLang, sourceLang = 'auto') {
        const apiUrl = this.config.apiUrl || 'https://translation.googleapis.com/language/translate/v2';
        
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': this.config.apiKey
            },
            body: JSON.stringify({
                q: text,
                source: sourceLang === 'auto' ? undefined : sourceLang,
                target: targetLang,
                format: 'text'
            })
        };

        const response = await fetch(apiUrl, requestOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Google Translate API 请求失败');
        }

        return data.data.translations[0].translatedText;
    }

    /**
     * 使用百度AI翻译进行翻译
     * @param {string} text - 要翻译的文本
     * @param {string} targetLang - 目标语言
     * @param {string} sourceLang - 源语言
     * @returns {Promise<string>} - 翻译后的文本
     */
    async translateWithBaiduAI(text, targetLang, sourceLang = 'auto') {
        const apiUrl = this.config.apiUrl || 'https://aip.baidubce.com/rpc/2.0/mt/texttrans/v1';
        
        // 百度语言代码映射
        const langMap = {
            'auto': 'auto',
            'zh-CN': 'zh',
            'en': 'en',
            'ja': 'jp',
            'ko': 'kor',
            'fr': 'fra',
            'de': 'de',
            'es': 'spa',
            'ru': 'ru',
            'pt': 'pt',
            'it': 'it',
            'nl': 'nl',
            'sv': 'swe',
            'no': 'nor',
            'da': 'dan',
            'fi': 'fin'
        };
        
        const source = langMap[sourceLang] || sourceLang;
        const target = langMap[targetLang] || targetLang;

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                q: text,
                from: source,
                to: target,
                termIds: []
            })
        };

        const response = await fetch(apiUrl, requestOptions);
        const data = await response.json();

        if (!response.ok || data.error_code) {
            throw new Error(data.error_msg || '百度AI翻译请求失败');
        }

        return data.result.trans_result.map(item => item.dst).join('\n');
    }

    /**
     * 使用有道AI翻译进行翻译
     * @param {string} text - 要翻译的文本
     * @param {string} targetLang - 目标语言
     * @param {string} sourceLang - 源语言
     * @returns {Promise<string>} - 翻译后的文本
     */
    async translateWithYoudaoAI(text, targetLang, sourceLang = 'auto') {
        const apiUrl = this.config.apiUrl || 'https://openapi.youdao.com/api';
        
        // 有道语言代码映射
        const langMap = {
            'auto': 'auto',
            'zh-CN': 'zh-CHS',
            'en': 'en',
            'ja': 'ja',
            'ko': 'ko',
            'fr': 'fr',
            'de': 'de',
            'es': 'es',
            'ru': 'ru',
            'pt': 'pt',
            'it': 'it',
            'nl': 'nl',
            'sv': 'sv',
            'no': 'no',
            'da': 'da',
            'fi': 'fi'
        };
        
        const source = langMap[sourceLang] || sourceLang;
        const target = langMap[targetLang] || targetLang;
        
        // 生成签名
        const salt = Math.random().toString(36).substring(2);
        const sign = this.md5(`${this.config.apiKey}${text}${salt}`);

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                q: text,
                from: source,
                to: target,
                appKey: this.config.apiKey.split(':')[0],
                salt: salt,
                sign: sign
            })
        };

        const response = await fetch(apiUrl, requestOptions);
        const data = await response.json();

        if (data.errorCode !== '0') {
            throw new Error(data.errorMsg || '有道AI翻译请求失败');
        }

        return data.translation.join('\n');
    }

    /**
     * 使用百度翻译进行翻译
     * @param {string} text - 要翻译的文本
     * @param {string} targetLang - 目标语言
     * @param {string} sourceLang - 源语言
     * @returns {Promise<string>} - 翻译后的文本
     */
    async translateWithBaidu(text, targetLang, sourceLang = 'auto') {
        const apiUrl = this.config.apiUrl || 'https://fanyi.baidu.com/v2transapi';
        
        // 百度语言代码映射
        const langMap = {
            'auto': 'auto',
            'zh-CN': 'zh',
            'en': 'en',
            'ja': 'jp',
            'ko': 'kor',
            'fr': 'fra',
            'de': 'de',
            'es': 'spa'
        };
        
        const source = langMap[sourceLang] || sourceLang;
        const target = langMap[targetLang] || targetLang;

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                from: source,
                to: target,
                query: text,
                simple_means_flag: 3
            })
        };

        const response = await fetch(apiUrl, requestOptions);
        const data = await response.json();

        if (!response.ok || !data.trans_result) {
            throw new Error('百度翻译请求失败');
        }

        return data.trans_result.data.map(item => item.dst).join('\n');
    }

    /**
     * 使用有道翻译进行翻译
     * @param {string} text - 要翻译的文本
     * @param {string} targetLang - 目标语言
     * @param {string} sourceLang - 源语言
     * @returns {Promise<string>} - 翻译后的文本
     */
    async translateWithYoudao(text, targetLang, sourceLang = 'auto') {
        const apiUrl = this.config.apiUrl || 'https://fanyi.youdao.com/translate';
        
        // 有道语言代码映射
        const langMap = {
            'auto': 'AUTO',
            'zh-CN': 'ZH_CN',
            'en': 'EN',
            'ja': 'JA',
            'ko': 'KO',
            'fr': 'FR',
            'de': 'DE',
            'es': 'ES'
        };
        
        const source = langMap[sourceLang] || sourceLang;
        const target = langMap[targetLang] || targetLang;

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                i: text,
                from: source,
                to: target,
                smartresult: 'dict',
                client: 'fanyideskweb',
                doctype: 'json',
                version: '2.1',
                keyfrom: 'fanyi.web',
                action: 'FY_BY_REALTlME'
            })
        };

        const response = await fetch(apiUrl, requestOptions);
        const data = await response.json();

        if (!response.ok || data.errorCode) {
            throw new Error('有道翻译请求失败');
        }

        return data.translateResult.map(item => item[0].tgt).join('\n');
    }

    /**
     * 模拟翻译功能（用于演示和测试）
     * @param {string} text - 要翻译的文本
     * @param {string} targetLang - 目标语言
     * @returns {string} - 模拟翻译后的文本
     */
    mockTranslate(text, targetLang) {
        // 简单的模拟翻译，实际项目中可以替换为更复杂的逻辑
        const mockTranslations = {
            'hello': '你好',
            'world': '世界',
            'love': '爱',
            'music': '音乐',
            'song': '歌曲',
            'lyrics': '歌词',
            'translate': '翻译',
            'AI': '人工智能',
            'hello world': '你好世界',
            'I love music': '我热爱音乐',
            'This is a song': '这是一首歌',
            'Translate lyrics with AI': '用人工智能翻译歌词',
            'How are you': '你好吗',
            'Good morning': '早上好',
            'Thank you': '谢谢',
            "You're welcome": '不客气',
            'Goodbye': '再见'
        };

        // 替换常见短语
        let translated = text;
        for (const [key, value] of Object.entries(mockTranslations)) {
            translated = translated.replace(new RegExp(key, 'gi'), value);
        }

        // 添加翻译标记，以便用户区分
        if (targetLang === 'zh-CN' || targetLang === '中文') {
            translated = translated + ' [译]';
        }

        return translated;
    }

    /**
     * MD5哈希函数（用于有道翻译签名生成）
     * @param {string} str - 要哈希的字符串
     * @returns {string} - MD5哈希值
     */
    md5(str) {
        // 简单的MD5实现，实际项目中可以使用更安全的实现
        const crypto = require('crypto');
        return crypto.createHash('md5').update(str).digest('hex');
    }

    /**
     * 批量翻译歌词行
     * @param {Array<Object>} lyricLines - 歌词行数组
     * @param {string} targetLang - 目标语言
     * @returns {Promise<Array<Object>>} - 翻译后的歌词行数组
     */
    async translateLyricLines(lyricLines, targetLang) {
        // 提取需要翻译的文本行
        const textElements = lyricLines.filter(line => line.type === 'lyric');
        if (textElements.length === 0) {
            return lyricLines;
        }

        const textToTranslate = textElements.map(line => line.text).join('\n');
        
        // 调用翻译服务
        const translatedText = await this.translate(textToTranslate, targetLang);
        const translatedLines = translatedText.split('\n');

        // 将翻译结果合并回歌词行
        let translateIndex = 0;
        return lyricLines.map(line => {
            if (line.type === 'lyric') {
                return {
                    ...line,
                    translatedText: translatedLines[translateIndex] || line.text
                };
            }
            return line;
        });
    }

    /**
     * 验证 API 密钥是否有效
     * @returns {Promise<boolean>} - API 密钥是否有效
     */
    async validateApiKey() {
        if (this.config.service === 'mock' || !this.services[this.config.service].requiresKey) {
            return true;
        }

        if (!this.config.apiKey) {
            return false;
        }

        try {
            // 发送一个简单的测试请求
            await this.translate('test', 'en', 'en');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取当前翻译服务信息
     * @returns {Object} - 翻译服务信息
     */
    getCurrentService() {
        return this.services[this.config.service] || this.services.mock;
    }

    /**
     * 获取所有翻译服务列表
     * @returns {Array<Object>} - 翻译服务列表
     */
    getServices() {
        return this.services;
    }

    /**
     * 获取AI翻译服务列表
     * @returns {Array<Object>} - AI翻译服务列表
     */
    getAIServices() {
        return Object.entries(this.services)
            .filter(([key, service]) => service.isAI)
            .map(([key, service]) => ({ key, ...service }));
    }

    /**
     * 获取非AI翻译服务列表
     * @returns {Array<Object>} - 非AI翻译服务列表
     */
    getNonAIServices() {
        return Object.entries(this.services)
            .filter(([key, service]) => !service.isAI)
            .map(([key, service]) => ({ key, ...service }));
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIService;
} else {
    // 浏览器环境全局导出
    window.AIService = AIService;
}