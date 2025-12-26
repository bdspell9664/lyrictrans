/**
 * AI 服务工具类
 * 提供歌词翻译功能，仅支持百度翻译服务
 */
class AIService {
    /**
     * 初始化 AI 服务
     * @param {Object} config - 配置参数
     * @param {string} config.appid - 百度翻译APP ID
     * @param {string} config.secretKey - 百度翻译密钥
     */
    constructor(config = {
        appid: '20251221002524051',
        secretKey: 'tuvZN9D5mU7MtYcCPreF'
    }) {
        this.config = {
            appid: config.appid || '20251221002524051',
            secretKey: config.secretKey || 'tuvZN9D5mU7MtYcCPreF',
            service: 'baidu' // 仅支持百度翻译
        };
    }

    /**
     * 切换翻译服务（仅支持百度翻译，此方法保留为兼容原有代码）
     * @param {string} service - 翻译服务类型
     * @param {string} apiKey - API 密钥
     */
    switchService(service, apiKey = '') {
        // 仅支持百度翻译，忽略其他服务
        console.warn('仅支持百度翻译服务，此调用已忽略');
    }

    /**
     * 翻译歌词文本
     * @param {string} text - 要翻译的文本
     * @param {string} targetLang - 目标语言
     * @param {string} sourceLang - 源语言（可选，默认自动检测）
     * @returns {Promise<string>} - 翻译后的文本
     */
    async translate(text, targetLang, sourceLang = 'auto') {
        try {
            // 调用百度翻译方法
            return await this.translateWithBaidu(text, targetLang, sourceLang);
        } catch (error) {
            console.error('百度翻译失败:', error);
            // 失败时返回原文，添加错误标记
            return text.split('\n').map(line => `${line} [翻译失败: ${error.message}]`).join('\n');
        }
    }

    /**
     * 使用百度翻译API进行翻译
     * @param {string} text - 要翻译的文本
     * @param {string} targetLang - 目标语言
     * @param {string} sourceLang - 源语言
     * @returns {Promise<string>} - 翻译后的文本
     */
    async translateWithBaidu(text, targetLang, sourceLang = 'auto') {
        // 使用用户提供的默认百度翻译API配置
        const appid = this.config.appid;
        const secretKey = this.config.secretKey;
        const apiUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
        
        // 百度语言代码映射
        const langMap = {
            'auto': 'auto',
            'zh-CN': 'zh',
            'zh': 'zh',
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
        
        // 设置源语言和目标语言
        let from = langMap[sourceLang] || 'auto';
        let to = langMap[targetLang] || 'zh';

        // 生成随机数
        const salt = Math.floor(Math.random() * 1000000000).toString();
        
        // 生成签名
        const sign = this.md5(`${appid}${text}${salt}${secretKey}`);

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                q: text,
                from: from,
                to: to,
                appid: appid,
                salt: salt,
                sign: sign
            })
        };

        try {
            const response = await fetch(apiUrl, requestOptions);
            const data = await response.json();

            // 检查API返回的错误码
            if (data.error_code) {
                console.error('百度翻译API错误:', data.error_code, data.error_msg);
                throw new Error(`百度翻译API错误: ${data.error_msg} (${data.error_code})`);
            }

            if (!data.trans_result || !Array.isArray(data.trans_result)) {
                console.error('百度翻译API返回格式错误:', data);
                throw new Error('百度翻译API返回格式错误');
            }

            // 获取翻译结果
            return data.trans_result.map(item => item.dst).join('\n');
        } catch (error) {
            console.error('百度翻译请求失败:', error);
            throw error;
        }
    }

    /**
     * MD5哈希函数（用于百度翻译签名生成）
     * @param {string} str - 要哈希的字符串
     * @returns {string} - MD5哈希值
     */
    md5(str) {
        // 完整的MD5实现
        function md5cycle(x, k) {
            let a = x[0], b = x[1], c = x[2], d = x[3];

            a = ff(a, b, c, d, k[0], 7, 0xd76aa478);
            d = ff(d, a, b, c, k[1], 12, 0xe8c7b756);
            c = ff(c, d, a, b, k[2], 17, 0x242070db);
            b = ff(b, c, d, a, k[3], 22, 0xc1bdceee);
            a = ff(a, b, c, d, k[4], 7, 0xf57c0faf);
            d = ff(d, a, b, c, k[5], 12, 0x4787c62a);
            c = ff(c, d, a, b, k[6], 17, 0xa8304613);
            b = ff(b, c, d, a, k[7], 22, 0xfd469501);
            a = ff(a, b, c, d, k[8], 7, 0x698098d8);
            d = ff(d, a, b, c, k[9], 12, 0x8b44f7af);
            c = ff(c, d, a, b, k[10], 17, 0xffff5bb1);
            b = ff(b, c, d, a, k[11], 22, 0x895cd7be);
            a = ff(a, b, c, d, k[12], 7, 0x6b901122);
            d = ff(d, a, b, c, k[13], 12, 0xfd987193);
            c = ff(c, d, a, b, k[14], 17, 0xa679438e);
            b = ff(b, c, d, a, k[15], 22, 0x49b40821);

            a = gg(a, b, c, d, k[1], 5, 0xf61e2562);
            d = gg(d, a, b, c, k[6], 9, 0xc040b340);
            c = gg(c, d, a, b, k[11], 14, 0x265e5a51);
            b = gg(b, c, d, a, k[0], 20, 0xe9b6c7aa);
            a = gg(a, b, c, d, k[5], 5, 0xd62f105d);
            d = gg(d, a, b, c, k[10], 9, 0x2441453);
            c = gg(c, d, a, b, k[15], 14, 0xd8a1e681);
            b = gg(b, c, d, a, k[4], 20, 0xe7d3fbc8);
            a = gg(a, b, c, d, k[9], 5, 0x21e1cde6);
            d = gg(d, a, b, c, k[14], 9, 0xc33707d6);
            c = gg(c, d, a, b, k[3], 14, 0xf4d50d87);
            b = gg(b, c, d, a, k[8], 20, 0x455a14ed);
            a = gg(a, b, c, d, k[13], 5, 0xa9e3e905);
            d = gg(d, a, b, c, k[2], 9, 0xfcefa3f8);
            c = gg(c, d, a, b, k[7], 14, 0x676f02d9);
            b = gg(b, c, d, a, k[12], 20, 0x8d2a4c8a);

            a = hh(a, b, c, d, k[5], 4, 0xfffa3942);
            d = hh(d, a, b, c, k[8], 11, 0x8771f681);
            c = hh(c, d, a, b, k[11], 16, 0x6d9d6122);
            b = hh(b, c, d, a, k[14], 23, 0xfde5380c);
            a = hh(a, b, c, d, k[1], 4, 0xa4beeaa4);
            d = hh(d, a, b, c, k[4], 11, 0x4bdecfa9);
            c = hh(c, d, a, b, k[7], 16, 0xf6bb4b60);
            b = hh(b, c, d, a, k[10], 23, 0xbebfbc70);
            a = hh(a, b, c, d, k[13], 4, 0x289b7ec6);
            d = hh(d, a, b, c, k[0], 11, 0xeaa127fa);
            c = hh(c, d, a, b, k[3], 16, 0xd4ef3085);
            b = hh(b, c, d, a, k[6], 23, 0x4881d05);
            a = hh(a, b, c, d, k[9], 4, 0xd9d4d039);
            d = hh(d, a, b, c, k[12], 11, 0xe6db99e5);
            c = hh(c, d, a, b, k[15], 16, 0x1fa27cf8);
            b = hh(b, c, d, a, k[2], 23, 0xc4ac5665);

            a = ii(a, b, c, d, k[0], 6, 0xf4292244);
            d = ii(d, a, b, c, k[7], 10, 0x432aff97);
            c = ii(c, d, a, b, k[14], 15, 0xab9423a7);
            b = ii(b, c, d, a, k[5], 21, 0xfc93a039);
            a = ii(a, b, c, d, k[12], 6, 0x655b59c3);
            d = ii(d, a, b, c, k[3], 10, 0x8f0ccc92);
            c = ii(c, d, a, b, k[10], 15, 0xffeff47d);
            b = ii(b, c, d, a, k[1], 21, 0x85845dd1);
            a = ii(a, b, c, d, k[8], 6, 0x6fa87e4f);
            d = ii(d, a, b, c, k[15], 10, 0xfe2ce6e0);
            c = ii(c, d, a, b, k[6], 15, 0xa3014314);
            b = ii(b, c, d, a, k[13], 21, 0x4e0811a1);
            a = ii(a, b, c, d, k[4], 6, 0xf7537e82);
            d = ii(d, a, b, c, k[11], 10, 0xbd3af235);
            c = ii(c, d, a, b, k[2], 15, 0x2ad7d2bb);
            b = ii(b, c, d, a, k[9], 21, 0xeb86d391);

            x[0] = (a + x[0]) & 0xffffffff;
            x[1] = (b + x[1]) & 0xffffffff;
            x[2] = (c + x[2]) & 0xffffffff;
            x[3] = (d + x[3]) & 0xffffffff;
        }

        function cmn(q, a, b, x, s, t) {
            a = ((a + q) + (x + t)) & 0xffffffff;
            return ((a << s) | (a >>> (32 - s))) + b & 0xffffffff;
        }

        function ff(a, b, c, d, x, s, t) {
            return cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }

        function gg(a, b, c, d, x, s, t) {
            return cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }

        function hh(a, b, c, d, x, s, t) {
            return cmn(b ^ c ^ d, a, b, x, s, t);
        }

        function ii(a, b, c, d, x, s, t) {
            return cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        function md51(str) {
            let n = str.length;
            let state = [1732584193, -271733879, -1732584194, 271733878];
            let i;
            for (i = 0; i + 64 <= str.length; i += 64) {
                let k = [];
                for (let j = 0; j < 64; j += 4) {
                    k[j / 4] = str.charCodeAt(i + j) +
                        (str.charCodeAt(i + j + 1) << 8) +
                        (str.charCodeAt(i + j + 2) << 16) +
                        (str.charCodeAt(i + j + 3) << 24);
                }
                md5cycle(state, k);
            }
            let tail = str.substring(i);
            let k = [];
            for (let j = 0; j < 64; j++) {
                k[j] = j < tail.length ? tail.charCodeAt(j) : 0;
            }
            k[tail.length] = 0x80;
            if (tail.length >= 56) {
                md5cycle(state, k);
                for (let j = 0; j < 64; j++) k[j] = 0;
            }
            k[56] = (n * 8) & 0xffffffff;
            k[57] = ((n * 8) >>> 32) & 0xffffffff;
            md5cycle(state, k);
            let res = '';
            for (let j = 0; j < 4; j++) {
                for (let i = 0; i < 4; i++) {
                    res += (0x100 + ((state[j] >>> (i * 8)) & 0xff)).toString(16).substring(1);
                }
            }
            return res;
        }

        // 先进行UTF-8编码
        str = unescape(encodeURIComponent(str));
        return md51(str);
    }

    /**
     * UTF-8编码函数
     * @param {string} str - 要编码的字符串
     * @returns {string} - UTF-8编码后的字符串
     */
    utf8Encode(str) {
        str = str.replace(/\r\n/g, "\n");
        let utftext = "";

        for (let n = 0; n < str.length; n++) {
            const c = str.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }

        return utftext;
    }

    /**
     * 批量翻译歌词行
     * @param {Array<Object>} lyricLines - 歌词行数组
     * @param {string} targetLang - 目标语言
     * @returns {Promise<Array<Object>>} - 翻译后的歌词行数组
     */
    async translateLyricLines(lyricLines, targetLang) {
        // 提取所有需要翻译的行（包括lyric和text类型）
        const linesToTranslate = lyricLines.filter(line => 
            line.type === 'lyric' || line.type === 'text'
        );
        
        if (linesToTranslate.length === 0) {
            return lyricLines;
        }

        // 提取需要翻译的文本
        const textToTranslate = linesToTranslate.map(line => line.text).join('\n');
        
        // 调用翻译服务
        const translatedText = await this.translate(textToTranslate, targetLang);
        const translatedLines = translatedText.split('\n');

        // 将翻译结果合并回歌词行
        let translateIndex = 0;
        return lyricLines.map(line => {
            if (line.type === 'lyric' || line.type === 'text') {
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
        try {
            // 发送一个简单的测试请求
            await this.translate('test', 'zh-CN', 'en');
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
        return {
            name: '百度翻译',
            requiresKey: true,
            isAI: false
        };
    }

    /**
     * 获取所有翻译服务列表
     * @returns {Array<Object>} - 翻译服务列表
     */
    getServices() {
        return [{
            key: 'baidu',
            name: '百度翻译',
            requiresKey: true,
            isAI: false
        }];
    }

    /**
     * 获取AI翻译服务列表
     * @returns {Array<Object>} - AI翻译服务列表
     */
    getAIServices() {
        return []; // 百度翻译非AI服务
    }

    /**
     * 获取非AI翻译服务列表
     * @returns {Array<Object>} - 非AI翻译服务列表
     */
    getNonAIServices() {
        return this.getServices();
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIService;
} else {
    // 浏览器环境全局导出
    window.AIService = AIService;
}