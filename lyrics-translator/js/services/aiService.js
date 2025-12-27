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
        const proxyUrl = 'http://localhost:3001/translate'; // 使用本地代理服务器
        
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
            // 简化请求逻辑，直接发送请求到代理服务器
            const requestOptionsWithTimeout = {
                ...requestOptions,
                timeout: 10000 // 添加10秒超时
            };
            
            console.log('发送翻译请求到代理服务器:', proxyUrl);
            console.log('请求参数:', {
                text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
                from: from,
                to: to,
                appid: appid,
                salt: salt
            });
            
            // 通过代理服务器发送请求
            const response = await fetch(proxyUrl, requestOptions);
            console.log('代理服务器响应状态:', response.status);
            
            if (!response.ok) {
                throw new Error(`代理服务器请求失败，状态码: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('百度翻译API响应:', data);

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
            const translatedText = data.trans_result.map(item => item.dst).join('\n');
            console.log('翻译结果:', translatedText.substring(0, 100) + (translatedText.length > 100 ? '...' : ''));
            return translatedText;
        } catch (error) {
            console.error('百度翻译请求失败:', error.message);
            console.error('完整错误信息:', error);
            throw error;
        }
    }
    
    /**
     * 直接请求百度翻译API（备用方案）
     * @param {string} text - 要翻译的文本
     * @param {string} from - 源语言代码
     * @param {string} to - 目标语言代码
     * @param {string} appid - 百度翻译APP ID
     * @param {string} salt - 随机数
     * @param {string} sign - 签名
     * @returns {Promise<string>} - 翻译后的文本
     */
    async directBaiduRequest(text, from, to, appid, salt, sign) {
        const apiUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
        
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
            console.error('直接请求百度API失败:', error);
            throw error;
        }
    }

    /**
     * MD5哈希函数（用于百度翻译签名生成）
     * @param {string} str - 要哈希的字符串
     * @returns {string} - MD5哈希值
     */
    md5(str) {
        if (typeof require !== 'undefined') {
            // Node.js环境：使用内置crypto模块
            const crypto = require('crypto');
            return crypto.createHash('md5').update(str, 'utf8').digest('hex');
        } else if (typeof window !== 'undefined' && window.md5) {
            // 浏览器环境：使用全局md5函数（来自md5.js文件）
            return window.md5(str);
        } else {
            // 备用：使用简洁可靠的MD5实现
            return this.md5Fast(str);
        }
    }

    /**
     * 快速MD5实现
     * @param {string} str - 要哈希的字符串
     * @returns {string} - MD5哈希值
     */
    md5Fast(str) {
        // 简化的MD5实现，只支持ASCII字符
        const md5Table = [
            0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476
        ];

        const shiftAmounts = [
            7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
            5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
            4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
            6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
        ];

        const constants = [
            0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
            0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
            0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
            0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
            0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
            0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
            0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
            0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
            0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
            0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
            0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
            0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
            0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
            0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
            0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
            0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
        ];

        // 初始化变量
        let a = md5Table[0];
        let b = md5Table[1];
        let c = md5Table[2];
        let d = md5Table[3];

        // 处理输入数据
        const originalLength = str.length;
        const paddingLength = ((originalLength + 8) >>> 6) << 6;
        const buffer = new ArrayBuffer(paddingLength + 64);
        const bytes = new Uint8Array(buffer);
        const view = new DataView(buffer);

        // 填充数据
        for (let i = 0; i < originalLength; i++) {
            bytes[i] = str.charCodeAt(i);
        }
        bytes[originalLength] = 0x80;

        // 填充长度
        view.setUint32(paddingLength + 0, originalLength * 8, true);
        view.setUint32(paddingLength + 4, 0, true);

        // 主循环
        for (let i = 0; i < paddingLength; i += 64) {
            const x = new Array(16);
            for (let j = 0; j < 16; j++) {
                x[j] = view.getUint32(i + j * 4, true);
            }

            let aa = a;
            let bb = b;
            let cc = c;
            let dd = d;

            for (let j = 0; j < 64; j++) {
                let f, g;
                if (j < 16) {
                    f = (bb & cc) | ((~bb) & dd);
                    g = j;
                } else if (j < 32) {
                    f = (dd & bb) | ((~dd) & cc);
                    g = (5 * j + 1) % 16;
                } else if (j < 48) {
                    f = bb ^ cc ^ dd;
                    g = (3 * j + 5) % 16;
                } else {
                    f = cc ^ (bb | (~dd));
                    g = (7 * j) % 16;
                }

                const temp = dd;
                dd = cc;
                cc = bb;
                bb = this.addUnsigned(bb, this.rotateLeft(this.addUnsigned(this.addUnsigned(aa, f), this.addUnsigned(constants[j], x[g])), shiftAmounts[j]));
                aa = temp;
            }

            a = this.addUnsigned(a, aa);
            b = this.addUnsigned(b, bb);
            c = this.addUnsigned(c, cc);
            d = this.addUnsigned(d, dd);
        }

        // 转换为十六进制
        return this.wordToHex(a) + this.wordToHex(b) + this.wordToHex(c) + this.wordToHex(d);
    }

    /**
     * 无符号整数加法
     * @param {number} x - 第一个数
     * @param {number} y - 第二个数
     * @returns {number} - 相加结果
     */
    addUnsigned(x, y) {
        const lsw = (x & 0xffff) + (y & 0xffff);
        const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xffff);
    }

    /**
     * 循环左移
     * @param {number} num - 要移位的数
     * @param {number} cnt - 移位位数
     * @returns {number} - 移位结果
     */
    rotateLeft(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /**
     * 将32位整数转换为十六进制字符串
     * @param {number} num - 32位整数
     * @returns {string} - 十六进制字符串
     */
    wordToHex(num) {
        const hexChars = '0123456789abcdef';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += hexChars.charAt((num >> (24 - i * 8)) & 0xf);
            result += hexChars.charAt((num >> (20 - i * 8)) & 0xf);
        }
        return result;
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