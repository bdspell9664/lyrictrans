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
        const directApiUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate'; // 百度翻译API直接地址
        
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
        const signString = `${appid}${text}${salt}${secretKey}`;
        const sign = this.md5(signString);

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

        // 使用 AbortController 实现超时处理
        const createRequestWithTimeout = (url) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, 10000); // 10秒超时
            
            return {
                options: {
                    ...requestOptions,
                    signal: controller.signal
                },
                timeoutId
            };
        };

        try {
            // 检查代理服务器是否可用
            const isProxyAvailable = await this.checkProxyAvailability(proxyUrl);
            let response;
            let requestInfo;
            
            if (isProxyAvailable) {
                // 代理服务器可用，使用代理
                requestInfo = createRequestWithTimeout(proxyUrl);
                console.log('发送翻译请求到代理服务器:', proxyUrl);
                response = await fetch(proxyUrl, requestInfo.options);
            } else {
                // 代理服务器不可用，尝试直接调用API
                requestInfo = createRequestWithTimeout(directApiUrl);
                console.log('代理服务器不可用，尝试直接调用百度翻译API:', directApiUrl);
                response = await fetch(directApiUrl, requestInfo.options);
            }
            
            clearTimeout(requestInfo.timeoutId); // 清除超时定时器
            
            console.log('翻译请求响应状态:', response.status);
            
            if (!response.ok) {
                throw new Error(`请求失败，状态码: ${response.status}`);
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
            
            // 检查是否是跨域错误
            if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                throw new Error('翻译请求失败：跨域错误。请启动本地代理服务器后重试。在项目根目录执行：npm start');
            } else if (error.name === 'AbortError') {
                throw new Error('翻译请求超时。请检查网络连接或尝试重启代理服务器。');
            } else if (error.message.includes('Failed to fetch')) {
                throw new Error('翻译请求失败：无法连接到服务器。请确保本地代理服务器已启动，或检查网络连接。');
            }
            
            throw error;
        }
    }
    
    /**
     * 检查代理服务器是否可用
     * @param {string} proxyUrl - 代理服务器URL
     * @returns {Promise<boolean>} - 代理服务器是否可用
     */
    async checkProxyAvailability(proxyUrl) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, 2000); // 2秒超时
            
            const response = await fetch(proxyUrl, {
                method: 'HEAD',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.log('代理服务器不可用:', error.message);
            return false;
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
        try {
            // 首先尝试使用全局md5函数（来自md5.js文件）
            if (typeof window !== 'undefined' && window.md5) {
                return window.md5(str);
            } 
            // 直接使用内置的md5Fast实现
            else {
                return this.md5Fast(str);
            }
        } catch (error) {
            console.error('MD5生成失败:', error);
            // 失败时使用内置的md5Fast实现
            return this.md5Fast(str);
        }
    }

    /**
     * 简单可靠的MD5实现
     * @param {string|number|boolean|null|undefined} str - 要哈希的字符串或其他类型
     * @returns {string} - MD5哈希值
     */
    md5Fast(str) {
        // 确保输入是字符串类型
        if (str === undefined || str === null) {
            str = '';
        } else if (typeof str !== 'string') {
            str = String(str);
        }

        // 纯JavaScript MD5实现（用于所有环境）
        const rotateLeft = function(lValue, iShiftBits) {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        };

        const addUnsigned = function(lX, lY) {
            const lX4 = (lX & 0xFFFF0000) >> 16;
            const lX8 = lX & 0x0000FFFF;
            const lY4 = (lY & 0xFFFF0000) >> 16;
            const lY8 = lY & 0x0000FFFF;
            return (((lX4 + lY4) << 16) + (lX8 + lY8));
        };

        const F = function(x, y, z) {
            return (x & y) | ((~x) & z);
        };

        const G = function(x, y, z) {
            return (x & z) | (y & (~z));
        };

        const H = function(x, y, z) {
            return (x ^ y ^ z);
        };

        const I = function(x, y, z) {
            return (y ^ (x | (~z)));
        };

        const FF = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };

        const GG = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };

        const HH = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };

        const II = function(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };

        const convertToWordArray = function(str) {
            const lWordCount = Math.ceil(str.length / 4);
            const lWordArray = [];

            for (let i = 0; i < lWordCount * 4; i += 4) {
                lWordArray.push(
                    (str.charCodeAt(i) & 0xFF) << 24 |
                    (str.charCodeAt(i + 1) & 0xFF) << 16 |
                    (str.charCodeAt(i + 2) & 0xFF) << 8 |
                    (str.charCodeAt(i + 3) & 0xFF)
                );
            }

            return lWordArray;
        };

        const wordToHex = function(lValue) {
            const WordToHexValue = [];
            const HexValue = '0123456789abcdef';

            for (let lCount = 0; lCount < 4; lCount++) {
                WordToHexValue[lCount] = HexValue.charAt((lValue >> (28 - lCount * 8)) & 0xF);
            }

            return WordToHexValue.join('');
        };

        const x = convertToWordArray(str);
        let a = 0x67452301;
        let b = 0xEFCDAB89;
        let c = 0x98BADCFE;
        let d = 0x10325476;

        const k = [
            0xD76AA478, 0xE8C7B756, 0x242070DB, 0xC1BDCEEE,
            0xF57C0FAF, 0x4787C62A, 0xA8304613, 0xFD469501,
            0x698098D8, 0x8B44F7AF, 0xFFFF5BB1, 0x895CD7BE,
            0x6B901122, 0xFD987193, 0xA679438E, 0x49B40821,
            0xF61E2562, 0xC040B340, 0x265E5A51, 0xE9B6C7AA,
            0xD62F105D, 0x02441453, 0xD8A1E681, 0xE7D3FBC8,
            0x21E1CDE6, 0xC33707D6, 0xF4D50D87, 0x455A14ED,
            0xA9E3E905, 0xFCEFA3F8, 0x676F02D9, 0x8D2A4C8A,
            0xFFFA3942, 0x8771F681, 0x6D9D6122, 0xFDE5380C,
            0xA4BEEA44, 0x4BDECFA9, 0xF6BB4B60, 0xBEBFBC70,
            0x289B7EC6, 0xEAA127FA, 0xD4EF3085, 0x04881D05,
            0xD9D4D039, 0xE6DB99E5, 0x1FA27CF8, 0xC4AC5665,
            0xF4292244, 0x432AFF97, 0xAB9423A7, 0xFC93A039,
            0x655B59C3, 0x8F0CCC92, 0xFFEFF47D, 0x85845DD1,
            0x6FA87E4F, 0xFE2CE6E0, 0xA3014314, 0x4E0811A1,
            0xF7537E82, 0xBD3AF235, 0x2AD7D2BB, 0xEB86D391
        ];

        const r = [
            7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
            5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
            4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
            6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
        ];

        const olda = a;
        const oldb = b;
        const oldc = c;
        const oldd = d;

        for (let i = 0; i < x.length; i += 16) {
            let aa = a;
            let bb = b;
            let cc = c;
            let dd = d;

            aa = FF(aa, bb, cc, dd, x[i + 0], r[0], k[0]);
            dd = FF(dd, aa, bb, cc, x[i + 1], r[1], k[1]);
            cc = FF(cc, dd, aa, bb, x[i + 2], r[2], k[2]);
            bb = FF(bb, cc, dd, aa, x[i + 3], r[3], k[3]);
            aa = FF(aa, bb, cc, dd, x[i + 4], r[4], k[4]);
            dd = FF(dd, aa, bb, cc, x[i + 5], r[5], k[5]);
            cc = FF(cc, dd, aa, bb, x[i + 6], r[6], k[6]);
            bb = FF(bb, cc, dd, aa, x[i + 7], r[7], k[7]);
            aa = FF(aa, bb, cc, dd, x[i + 8], r[8], k[8]);
            dd = FF(dd, aa, bb, cc, x[i + 9], r[9], k[9]);
            cc = FF(cc, dd, aa, bb, x[i + 10], r[10], k[10]);
            bb = FF(bb, cc, dd, aa, x[i + 11], r[11], k[11]);
            aa = FF(aa, bb, cc, dd, x[i + 12], r[12], k[12]);
            dd = FF(dd, aa, bb, cc, x[i + 13], r[13], k[13]);
            cc = FF(cc, dd, aa, bb, x[i + 14], r[14], k[14]);
            bb = FF(bb, cc, dd, aa, x[i + 15], r[15], k[15]);

            aa = GG(aa, bb, cc, dd, x[i + 1], r[16], k[16]);
            dd = GG(dd, aa, bb, cc, x[i + 6], r[17], k[17]);
            cc = GG(cc, dd, aa, bb, x[i + 11], r[18], k[18]);
            bb = GG(bb, cc, dd, aa, x[i + 0], r[19], k[19]);
            aa = GG(aa, bb, cc, dd, x[i + 5], r[20], k[20]);
            dd = GG(dd, aa, bb, cc, x[i + 10], r[21], k[21]);
            cc = GG(cc, dd, aa, bb, x[i + 15], r[22], k[22]);
            bb = GG(bb, cc, dd, aa, x[i + 4], r[23], k[23]);
            aa = GG(aa, bb, cc, dd, x[i + 9], r[24], k[24]);
            dd = GG(dd, aa, bb, cc, x[i + 14], r[25], k[25]);
            cc = GG(cc, dd, aa, bb, x[i + 3], r[26], k[26]);
            bb = GG(bb, cc, dd, aa, x[i + 8], r[27], k[27]);
            aa = GG(aa, bb, cc, dd, x[i + 13], r[28], k[28]);
            dd = GG(dd, aa, bb, cc, x[i + 2], r[29], k[29]);
            cc = GG(cc, dd, aa, bb, x[i + 7], r[30], k[30]);
            bb = GG(bb, cc, dd, aa, x[i + 12], r[31], k[31]);

            aa = HH(aa, bb, cc, dd, x[i + 5], r[32], k[32]);
            dd = HH(dd, aa, bb, cc, x[i + 8], r[33], k[33]);
            cc = HH(cc, dd, aa, bb, x[i + 11], r[34], k[34]);
            bb = HH(bb, cc, dd, aa, x[i + 14], r[35], k[35]);
            aa = HH(aa, bb, cc, dd, x[i + 1], r[36], k[36]);
            dd = HH(dd, aa, bb, cc, x[i + 4], r[37], k[37]);
            cc = HH(cc, dd, aa, bb, x[i + 7], r[38], k[38]);
            bb = HH(bb, cc, dd, aa, x[i + 10], r[39], k[39]);
            aa = HH(aa, bb, cc, dd, x[i + 13], r[40], k[40]);
            dd = HH(dd, aa, bb, cc, x[i + 0], r[41], k[41]);
            cc = HH(cc, dd, aa, bb, x[i + 3], r[42], k[42]);
            bb = HH(bb, cc, dd, aa, x[i + 6], r[43], k[43]);
            aa = HH(aa, bb, cc, dd, x[i + 9], r[44], k[44]);
            dd = HH(dd, aa, bb, cc, x[i + 12], r[45], k[45]);
            cc = HH(cc, dd, aa, bb, x[i + 15], r[46], k[46]);
            bb = HH(bb, cc, dd, aa, x[i + 2], r[47], k[47]);

            aa = II(aa, bb, cc, dd, x[i + 0], r[48], k[48]);
            dd = II(dd, aa, bb, cc, x[i + 7], r[49], k[49]);
            cc = II(cc, dd, aa, bb, x[i + 14], r[50], k[50]);
            bb = II(bb, cc, dd, aa, x[i + 5], r[51], k[51]);
            aa = II(aa, bb, cc, dd, x[i + 12], r[52], k[52]);
            dd = II(dd, aa, bb, cc, x[i + 3], r[53], k[53]);
            cc = II(cc, dd, aa, bb, x[i + 10], r[54], k[54]);
            bb = II(bb, cc, dd, aa, x[i + 1], r[55], k[55]);
            aa = II(aa, bb, cc, dd, x[i + 8], r[56], k[56]);
            dd = II(dd, aa, bb, cc, x[i + 15], r[57], k[57]);
            cc = II(cc, dd, aa, bb, x[i + 6], r[58], k[58]);
            bb = II(bb, cc, dd, aa, x[i + 13], r[59], k[59]);
            aa = II(aa, bb, cc, dd, x[i + 4], r[60], k[60]);
            dd = II(dd, aa, bb, cc, x[i + 11], r[61], k[61]);
            cc = II(cc, dd, aa, bb, x[i + 2], r[62], k[62]);
            bb = II(bb, cc, dd, aa, x[i + 9], r[63], k[63]);

            a = addUnsigned(a, aa);
            b = addUnsigned(b, bb);
            c = addUnsigned(c, cc);
            d = addUnsigned(d, dd);
        }

        return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
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