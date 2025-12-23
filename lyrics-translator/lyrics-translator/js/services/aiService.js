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
            const translatedLines = data.trans_result.map(item => item.dst);
            const originalLines = text.split('\n');
            
            // 确保原文和译文行数匹配
            const combinedLines = originalLines.map((original, index) => {
                const translated = translatedLines[index] || '';
                return `${original} ${translated}`;
            });

            return combinedLines.join('\n');
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
        // 简化的MD5实现，避免const变量重新赋值问题
        const md5Table = [
            0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
            0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
            0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
            0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
            0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
            0xd62f105d, 0x2441453, 0xd8a1e681, 0xe7d3fbc8,
            0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
            0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
            0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
            0xa4beeaa4, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
            0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x4881d05,
            0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
            0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
            0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
            0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
            0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
        ];

        const shiftAmounts = [
            [7, 12, 17, 22], [5, 9, 14, 20], [4, 11, 16, 23], [6, 10, 15, 21]
        ];

        // Helper functions
        function leftRotate(value, shift) {
            return (value << shift) | (value >>> (32 - shift));
        }

        function toHex(value) {
            let hex = '';
            for (let i = 0; i < 4; i++) {
                const byte = (value >>> (i * 8)) & 0xff;
                hex += ('0' + byte.toString(16)).slice(-2);
            }
            return hex;
        }

        // Preprocessing
        str = this.utf8Encode(str);
        const originalLength = str.length * 8;
        
        // Append the bit '1' to the message
        str += String.fromCharCode(0x80);
        
        // Append bits '0' until message length is congruent to 448 (mod 512)
        while ((str.length * 8) % 512 !== 448) {
            str += String.fromCharCode(0x00);
        }
        
        // Append original length as a 64-bit integer
        for (let i = 0; i < 8; i++) {
            str += String.fromCharCode((originalLength >>> (i * 8)) & 0xff);
        }

        // Initialize variables
        let a = 0x67452301;
        let b = 0xefcdab89;
        let c = 0x98badcfe;
        let d = 0x10325476;

        // Process each 512-bit chunk
        for (let i = 0; i < str.length; i += 64) {
            const chunk = str.slice(i, i + 64);
            const words = [];
            
            // Break chunk into 16 32-bit words
            for (let j = 0; j < 16; j++) {
                words[j] = 
                    (chunk.charCodeAt(j * 4) & 0xff) |
                    ((chunk.charCodeAt(j * 4 + 1) & 0xff) << 8) |
                    ((chunk.charCodeAt(j * 4 + 2) & 0xff) << 16) |
                    ((chunk.charCodeAt(j * 4 + 3) & 0xff) << 24);
            }

            // Save current values
            let aa = a;
            let bb = b;
            let cc = c;
            let dd = d;

            // Main loop
            for (let j = 0; j < 64; j++) {
                let f, g;
                if (j < 16) {
                    f = (b & c) | (~b & d);
                    g = j;
                } else if (j < 32) {
                    f = (d & b) | (~d & c);
                    g = (5 * j + 1) % 16;
                } else if (j < 48) {
                    f = b ^ c ^ d;
                    g = (3 * j + 5) % 16;
                } else {
                    f = c ^ (b | ~d);
                    g = (7 * j) % 16;
                }

                const temp = d;
                d = c;
                c = b;
                b = b + leftRotate((a + f + md5Table[j] + words[g]) >>> 0, shiftAmounts[Math.floor(j / 16)][j % 4]);
                a = temp;
            }

            // Update variables with results of this chunk
            a = (a + aa) >>> 0;
            b = (b + bb) >>> 0;
            c = (c + cc) >>> 0;
            d = (d + dd) >>> 0;
        }

        // Convert to hex string
        return toHex(a) + toHex(b) + toHex(c) + toHex(d);
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