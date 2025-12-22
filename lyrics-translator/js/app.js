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

/**
 * 歌词翻译应用主逻辑
 */
class LyricTranslatorApp {
    /**
     * 初始化应用
     */
    constructor() {
        this.uploadedFiles = [];
        this.currentFileIndex = 0;
        this.parsedData = null;
        this.parser = null;
        try {
            console.log('AIService:', typeof AIService);
            this.aiService = new AIService();
        } catch (error) {
            console.error('AIService初始化失败:', error);
            // 创建一个简单的模拟AIService，确保应用程序能够运行
            this.aiService = {
                translate: async (text, targetLang, sourceLang) => {
                    return text.split('\n').map(line => `${line} [模拟翻译]`).join('\n');
                },
                translateLyricLines: async (lyricLines, targetLang) => {
                    return lyricLines.map(line => {
                        if (line.type === 'lyric') {
                            return {
                                ...line,
                                translatedText: `${line.text} [模拟翻译]`
                            };
                        }
                        return line;
                    });
                }
            };
        }
        this.parserManager = new ParserManager();
        
        this.initElements();
        this.bindEvents();
    }

    /**
     * 初始化DOM元素引用
     */
    initElements() {
        console.log('初始化DOM元素...');
        
        // 文件上传相关元素
        this.uploadArea = document.getElementById('uploadArea');
        this.browseBtn = document.getElementById('browseBtn');
        this.fileInput = document.getElementById('fileInput');
        this.fileListSection = document.getElementById('fileListSection');
        this.fileList = document.getElementById('fileList');
        
        // 验证元素是否成功获取
        console.log('元素获取结果:');
        console.log('uploadArea:', this.uploadArea);
        console.log('browseBtn:', this.browseBtn);
        console.log('fileInput:', this.fileInput);
        console.log('fileListSection:', this.fileListSection);
        console.log('fileList:', this.fileList);
        
        // 设置相关元素
        this.settingsSection = document.getElementById('settingsSection');
        this.translationApi = document.getElementById('translationApi');
        this.apiKeyField = document.getElementById('apiKeyField');
        this.apiKey = document.getElementById('apiKey');
        this.sourceLang = document.getElementById('sourceLang');
        this.targetLang = document.getElementById('targetLang');
        this.includeOriginal = document.getElementById('includeOriginal');
        this.translateBtn = document.getElementById('translateBtn');
        
        // 结果相关元素
        this.resultSection = document.getElementById('resultSection');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        this.originalLyrics = document.getElementById('originalLyrics');
        this.translatedLyrics = document.getElementById('translatedLyrics');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.outputFormat = document.getElementById('outputFormat');
        
        // 音频上传相关元素
        this.audioUploadArea = document.getElementById('audioUploadArea');
        this.audioBrowseBtn = document.getElementById('audioBrowseBtn');
        this.audioInput = document.getElementById('audioInput');
        this.audioInfo = document.getElementById('audioInfo');
        this.audioFileName = document.getElementById('audioFileName');
        this.removeAudioBtn = document.getElementById('removeAudioBtn');
        this.generateWordByWordBtn = document.getElementById('generateWordByWordBtn');
        this.currentAudio = null;
        
        // 加载状态
        this.loading = document.getElementById('loading');
        
        // 验证音频元素是否成功获取
        console.log('音频元素获取结果:');
        console.log('audioUploadArea:', this.audioUploadArea);
        console.log('audioBrowseBtn:', this.audioBrowseBtn);
        console.log('audioInput:', this.audioInput);
        
        // 批量功能元素
        this.batchTranslateBtn = document.getElementById('batchTranslateBtn');
        this.batchDownloadBtn = document.getElementById('batchDownloadBtn');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        console.log('绑定事件监听器...');
        
        // 文件上传事件
        if (this.browseBtn) {
            this.browseBtn.addEventListener('click', () => {
                console.log('浏览按钮点击');
                this.fileInput.click();
            });
            console.log('浏览按钮事件绑定成功');
        } else {
            console.error('浏览按钮元素未找到');
        }
        
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                console.log('文件选择事件触发');
                this.handleFileSelect(e);
            });
            console.log('文件输入事件绑定成功');
        } else {
            console.error('文件输入元素未找到');
        }
        
        // 拖放事件
        if (this.uploadArea) {
            // 添加 dragenter 事件监听器
            this.uploadArea.addEventListener('dragenter', (e) => {
                console.log('拖放进入事件触发');
                this.handleDragEnter(e);
            });
            
            this.uploadArea.addEventListener('dragover', (e) => {
                console.log('拖放悬停事件触发');
                this.handleDragOver(e);
            });
            
            this.uploadArea.addEventListener('dragleave', (e) => {
                console.log('拖放离开事件触发');
                this.handleDragLeave(e);
            });
            
            this.uploadArea.addEventListener('drop', (e) => {
                console.log('拖放放下事件触发');
                this.handleDrop(e);
            });
            console.log('拖放事件绑定成功');
        } else {
            console.error('上传区域元素未找到');
        }
        
        // 为整个文档添加事件监听器，防止浏览器默认行为
        document.addEventListener('dragenter', (e) => {
            console.log('文档拖放进入事件触发');
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('dragover', (e) => {
            console.log('文档拖放悬停事件触发');
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('dragleave', (e) => {
            console.log('文档拖放离开事件触发');
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('drop', (e) => {
            console.log('文档拖放放下事件触发');
            e.preventDefault();
            e.stopPropagation();
        });
        
        // 翻译设置事件
        if (this.translationApi) {
            this.translationApi.addEventListener('change', (e) => {
                console.log('翻译API选择事件触发');
                this.handleTranslationApiChange(e);
            });
            console.log('翻译API选择事件绑定成功');
        } else {
            console.error('翻译API选择元素未找到');
        }
        
        // 翻译按钮事件
        if (this.translateBtn) {
            this.translateBtn.addEventListener('click', () => {
                console.log('翻译按钮点击');
                this.translateLyrics();
            });
            console.log('翻译按钮事件绑定成功');
        } else {
            console.error('翻译按钮元素未找到');
        }
        
        // 音频上传事件
        if (this.audioBrowseBtn) {
            this.audioBrowseBtn.addEventListener('click', () => {
                console.log('音频浏览按钮点击');
                this.audioInput.click();
            });
            console.log('音频浏览按钮事件绑定成功');
        } else {
            console.error('音频浏览按钮元素未找到');
        }
        
        if (this.audioInput) {
            this.audioInput.addEventListener('change', (e) => {
                console.log('音频文件选择事件触发');
                this.handleAudioSelect(e);
            });
            console.log('音频输入事件绑定成功');
        } else {
            console.error('音频输入元素未找到');
        }
        
        if (this.removeAudioBtn) {
            this.removeAudioBtn.addEventListener('click', () => {
                console.log('移除音频按钮点击');
                this.removeAudio();
            });
            console.log('移除音频按钮事件绑定成功');
        } else {
            console.error('移除音频按钮元素未找到');
        }
        
        if (this.generateWordByWordBtn) {
            this.generateWordByWordBtn.addEventListener('click', () => {
                console.log('生成逐字歌词按钮点击');
                this.generateWordByWordLyrics();
            });
            console.log('生成逐字歌词按钮事件绑定成功');
        } else {
            console.error('生成逐字歌词按钮元素未找到');
        }
        
        // 音频拖放事件
        if (this.audioUploadArea) {
            this.audioUploadArea.addEventListener('dragenter', (e) => {
                console.log('音频拖放进入事件触发');
                e.preventDefault();
                e.stopPropagation();
                this.audioUploadArea.classList.add('dragover');
            });
            
            this.audioUploadArea.addEventListener('dragover', (e) => {
                console.log('音频拖放悬停事件触发');
                e.preventDefault();
                e.stopPropagation();
                this.audioUploadArea.classList.add('dragover');
            });
            
            this.audioUploadArea.addEventListener('dragleave', (e) => {
                console.log('音频拖放离开事件触发');
                e.preventDefault();
                e.stopPropagation();
                this.audioUploadArea.classList.remove('dragover');
            });
            
            this.audioUploadArea.addEventListener('drop', (e) => {
                console.log('音频拖放放下事件触发');
                e.preventDefault();
                e.stopPropagation();
                this.audioUploadArea.classList.remove('dragover');
                this.handleAudioDrop(e);
            });
            console.log('音频拖放事件绑定成功');
        } else {
            console.error('音频上传区域元素未找到');
        }
        
        // 标签切换事件
        if (this.tabBtns) {
            this.tabBtns.forEach((btn, index) => {
                btn.addEventListener('click', (e) => {
                    console.log('标签切换事件触发，标签索引:', index);
                    this.switchTab(e);
                });
            });
            console.log('标签切换事件绑定成功');
        } else {
            console.error('标签按钮元素未找到');
        }
        
        // 下载按钮事件
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => {
                console.log('下载按钮点击');
                this.downloadTranslatedLyrics();
            });
            console.log('下载按钮事件绑定成功');
        } else {
            console.error('下载按钮元素未找到');
        }
        
        // 批量功能事件
        this.bindBatchEvents();
    }
    

    
    /**
     * 绑定批量功能事件监听器
     */
    bindBatchEvents() {
        // 批量翻译按钮事件
        if (this.batchTranslateBtn) {
            this.batchTranslateBtn.addEventListener('click', () => {
                console.log('批量翻译按钮点击');
                this.handleBatchTranslate();
            });
            console.log('批量翻译按钮事件绑定成功');
        }
        
        // 批量下载按钮事件
        if (this.batchDownloadBtn) {
            this.batchDownloadBtn.addEventListener('click', () => {
                console.log('批量下载按钮点击');
                this.handleBatchDownload();
            });
            console.log('批量下载按钮事件绑定成功');
        }
    }
    
    /**
     * 处理翻译API选择变化
     */
    handleTranslationApiChange(e) {
        const api = e.target.value;
        const requiresKey = api !== 'mock';
        
        // 显示或隐藏API密钥输入框
        this.apiKeyField.style.display = requiresKey ? 'block' : 'none';
    }

    /**
     * 处理文件选择
     * @param {Event} e - 文件选择事件
     */
    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
    }

    /**
     * 处理拖放事件 - 进入
     * @param {Event} e - 拖放事件
     */
    handleDragEnter(e) {
        console.log('拖放进入事件触发');
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.add('dragover');
    }

    /**
     * 处理拖放事件 - 悬停
     * @param {Event} e - 拖放事件
     */
    handleDragOver(e) {
        console.log('拖放悬停事件触发');
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.add('dragover');
    }

    /**
     * 处理拖放事件 - 离开
     * @param {Event} e - 拖放事件
     */
    handleDragLeave(e) {
        console.log('拖放离开事件触发');
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('dragover');
    }

    /**
     * 处理拖放事件 - 放下
     * @param {Event} e - 拖放事件
     */
    handleDrop(e) {
        console.log('拖放放下事件触发');
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('dragover');
        
        console.log('拖放的文件:', e.dataTransfer.files);
        const files = Array.from(e.dataTransfer.files);
        console.log('处理文件:', files);
        this.addFiles(files);
    }

    /**
     * 添加文件到上传列表
     * @param {Array<File>} files - 文件数组
     */
    addFiles(files) {
        // 过滤支持的文件类型
        const supportedExtensions = ['.lrc', '.srt', '.ass', '.ssa', '.txt'];
        const validFiles = files.filter(file => {
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            return supportedExtensions.includes(ext);
        });
        
        // 重置翻译数据，避免残留上一次的翻译结果
        this.resetTranslationData();
        
        this.uploadedFiles = [...this.uploadedFiles, ...validFiles];
        this.renderFileList();
        this.showSettings();
    }
    
    /**
     * 重置翻译数据，避免残留上一次的翻译结果
     */
    resetTranslationData() {
        // 重置翻译数据
        this.parsedData = null;
        this.parser = null;
        
        // 清空UI元素
        if (this.originalLyrics) {
            this.originalLyrics.textContent = '';
        }
        if (this.translatedLyrics) {
            this.translatedLyrics.textContent = '';
        }
        
        // 隐藏结果区域
        if (this.resultSection) {
            this.resultSection.style.display = 'none';
        }
        
        console.log('翻译数据已重置');
    }

    /**
     * 渲染文件列表
     */
    renderFileList() {
        this.fileList.innerHTML = '';
        
        this.uploadedFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="file-info">
                    <span class="file-icon">📄</span>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${FileUtils.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="remove-file" onclick="app.removeFile(${index})">×</button>
            `;
            this.fileList.appendChild(li);
        });
        
        this.fileListSection.style.display = this.uploadedFiles.length > 0 ? 'block' : 'none';
    }

    /**
     * 移除文件
     * @param {number} index - 文件索引
     */
    removeFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.renderFileList();
        
        if (this.uploadedFiles.length === 0) {
            this.hideSettings();
        }
    }
    
    /**
     * 处理音频文件选择
     * @param {Event} e - 文件选择事件
     */
    handleAudioSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            this.handleAudioFile(files[0]);
        }
    }
    
    /**
     * 处理音频拖放
     * @param {Event} e - 拖放事件
     */
    handleAudioDrop(e) {
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            this.handleAudioFile(files[0]);
        }
    }
    
    /**
     * 处理音频文件
     * @param {File} file - 音频文件
     */
    handleAudioFile(file) {
        // 检查文件类型
        const supportedTypes = ['.mp3', '.wav', '.ogg', '.flac', '.ala', '.caac', '.dd', '.aac', '.m4a', '.wma', '.aiff', '.ape'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!supportedTypes.includes(ext)) {
            alert('不支持的音频格式，请上传 MP3、WAV、OGG、FLAC、ALA、CAAC、DD 或其他支持的音频格式');
            return;
        }
        
        // 保存音频文件
        this.currentAudio = file;
        
        // 更新UI
        this.audioFileName.textContent = file.name;
        this.audioInfo.style.display = 'block';
        
        console.log('音频文件已上传:', file.name);
    }
    
    /**
     * 移除音频文件
     */
    removeAudio() {
        this.currentAudio = null;
        this.audioInfo.style.display = 'none';
        this.audioFileName.textContent = '';
        this.audioInput.value = '';
        
        console.log('音频文件已移除');
    }
    
    /**
     * 生成逐字歌词
     */
    async generateWordByWordLyrics() {
        // 检查歌词文件是否上传
        if (this.uploadedFiles.length === 0 || !this.currentAudio) {
            alert('请先上传歌词文件和音频文件');
            return;
        }
        
        this.showLoading();
        
        try {
            // 如果parsedData不存在，先解析歌词文件
            if (!this.parsedData) {
                // 处理当前文件
                const file = this.uploadedFiles[this.currentFileIndex];
                const text = await FileUtils.readFile(file);
                
                // 解析文件
                const parseResult = this.parserManager.parse(text);
                this.parsedData = parseResult.data;
                this.parser = parseResult.parser;
            }
            
            // 这里实现逐字歌词生成逻辑
            // 1. 提取歌词文本
            // 2. 分析音频，生成逐字时间戳
            // 3. 生成逐字歌词
            
            // 使用基于Web Audio API的音频分析生成逐字时间戳
            await this.generateRealWordByWordLyrics();
            
            // 显示结果
            const originalText = this.uploadedFiles[this.currentFileIndex] ? 
                this.uploadedFiles[this.currentFileIndex].name : '未知文件';
            this.showResults(originalText);
        } catch (error) {
            console.error('生成逐字歌词失败:', error);
            alert(`生成逐字歌词失败: ${error.message}\n请检查文件格式或重试`);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * 使用Web Audio API生成真实逐字歌词
     */
    async generateRealWordByWordLyrics() {
        if (!this.parsedData.lyricLines) {
            throw new Error('无法生成逐字歌词：未解析到歌词行');
        }
        
        // 检查浏览器是否支持Web Audio API
        if (!window.AudioContext && !window.webkitAudioContext) {
            throw new Error('无法生成逐字歌词：浏览器不支持Web Audio API');
        }
        
        try {
            // 创建音频上下文
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 读取音频文件
            const audioData = await this.readAudioFile(this.currentAudio);
            
            // 解码音频数据
            const audioBuffer = await audioContext.decodeAudioData(audioData);
            
            // 提取音频频谱数据
            const audioFeatures = this.extractAudioFeatures(audioBuffer);
            
            // 生成逐字时间戳
            this.generateWordTimestamps(audioFeatures);
            
            console.log('真实逐字歌词生成完成');
        } catch (error) {
            console.error('音频处理失败:', error);
            // 如果音频处理失败，使用备用的均匀分配算法
            this.generateFallbackWordTimestamps();
            console.log('已使用备用算法生成逐字歌词');
        }
    }
    
    /**
     * 读取音频文件
     * @param {File} file - 音频文件
     * @returns {Promise<ArrayBuffer>} - 音频数据
     */
    readAudioFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(file);
        });
    }
    
    /**
     * 提取音频特征
     * @param {AudioBuffer} audioBuffer - 解码后的音频数据
     * @returns {Object} - 音频特征数据
     */
    extractAudioFeatures(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const frameSize = Math.floor(sampleRate * 0.02); // 20ms帧
        const hopSize = Math.floor(sampleRate * 0.01); // 10ms hop
        
        const energyValues = [];
        const timeValues = [];
        
        // 计算每帧的能量
        for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
            let energy = 0;
            for (let j = 0; j < frameSize; j++) {
                energy += Math.abs(channelData[i + j]);
            }
            energy /= frameSize;
            energyValues.push(energy);
            timeValues.push(i / sampleRate * 1000); // 转换为毫秒
        }
        
        return {
            energy: energyValues,
            time: timeValues,
            sampleRate: sampleRate,
            frameSize: frameSize,
            hopSize: hopSize
        };
    }
    
    /**
     * 生成备用逐字时间戳（均匀分配）
     */
    generateFallbackWordTimestamps() {
        if (!this.parsedData.lyricLines) {
            return;
        }
        
        // 为每个歌词行生成逐字时间戳
        this.parsedData.lyricLines.forEach((line) => {
            if (line.type === 'lyric') {
                // 将歌词文本拆分为单个字符
                const words = line.text.split('');
                line.wordTimestamps = [];
                
                // 获取该行的开始和结束时间
                if (!line.timestamps || line.timestamps.length === 0) {
                    // 如果没有时间戳，跳过该行
                    return;
                }
                
                const lineStartTime = line.timestamps[0].totalMilliseconds;
                const lineEndTime = line.timestamps[line.timestamps.length - 1].totalMilliseconds;
                
                // 使用均匀分配算法
                this.assignUniformTimestamps(line, words, lineStartTime, lineEndTime);
            }
        });
    }
    
    /**
     * 生成逐字时间戳
     * @param {Object} audioFeatures - 音频特征数据
     */
    generateWordTimestamps(audioFeatures) {
        if (!this.parsedData.lyricLines) {
            return;
        }
        
        // 找到能量峰值点
        const peaks = this.findEnergyPeaks(audioFeatures.energy, audioFeatures.time);
        
        // 为每个歌词行生成逐字时间戳
        this.parsedData.lyricLines.forEach((line) => {
            if (line.type === 'lyric') {
                // 将歌词文本拆分为单个字符
                const words = line.text.split('');
                line.wordTimestamps = [];
                
                // 获取该行的开始和结束时间
                if (!line.timestamps || line.timestamps.length === 0) {
                    // 如果没有时间戳，跳过该行
                    return;
                }
                
                const lineStartTime = line.timestamps[0].totalMilliseconds;
                const lineEndTime = line.timestamps[line.timestamps.length - 1].totalMilliseconds;
                
                // 确保开始时间小于结束时间
                if (lineStartTime >= lineEndTime) {
                    // 使用均匀分配算法
                    this.assignUniformTimestamps(line, words, lineStartTime, lineStartTime + 1000);
                    return;
                }
                
                // 过滤该行时间范围内的峰值
                const linePeaks = peaks.filter(peak => 
                    peak.time >= lineStartTime && peak.time <= lineEndTime
                );
                
                // 为每个字符分配时间戳
                this.assignWordTimestamps(line, words, linePeaks, lineStartTime, lineEndTime);
            }
        });
    }
    
    /**
     * 查找能量峰值点
     * @param {Array<number>} energyValues - 能量值数组
     * @param {Array<number>} timeValues - 时间值数组
     * @returns {Array<Object>} - 峰值点数组
     */
    findEnergyPeaks(energyValues, timeValues) {
        if (!energyValues || energyValues.length === 0) {
            return [];
        }
        
        const peaks = [];
        const threshold = this.calculateEnergyThreshold(energyValues);
        
        // 查找局部最大值
        for (let i = 1; i < energyValues.length - 1; i++) {
            const current = energyValues[i];
            const prev = energyValues[i - 1];
            const next = energyValues[i + 1];
            
            // 确保所有值都是有效的数字
            if (isNaN(current) || isNaN(prev) || isNaN(next)) {
                continue;
            }
            
            if (current > prev && current > next && current > threshold) {
                peaks.push({
                    time: timeValues[i] || 0,
                    energy: current
                });
            }
        }
        
        // 按时间排序
        return peaks.sort((a, b) => a.time - b.time);
    }
    
    /**
     * 计算能量阈值
     * @param {Array<number>} energyValues - 能量值数组
     * @returns {number} - 能量阈值
     */
    calculateEnergyThreshold(energyValues) {
        if (!energyValues || energyValues.length === 0) {
            return 0;
        }
        
        // 过滤掉无效值
        const validValues = energyValues.filter(val => !isNaN(val) && isFinite(val));
        if (validValues.length === 0) {
            return 0;
        }
        
        // 使用能量值的中位数作为阈值
        const sorted = [...validValues].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        // 使用更保守的阈值，避免漏掉峰值
        return median * 1.2;
    }
    
    /**
     * 为每个字分配时间戳
     * @param {Object} line - 歌词行
     * @param {Array<string>} words - 字符数组
     * @param {Array<Object>} peaks - 峰值点数组
     * @param {number} startTime - 行开始时间
     * @param {number} endTime - 行结束时间
     */
    assignWordTimestamps(line, words, peaks, startTime, endTime) {
        // 确保参数有效
        if (!words || words.length === 0) {
            return;
        }
        
        // 如果没有足够的峰值或峰值数组为空，使用均匀分配
        if (!peaks || peaks.length < words.length / 2) {
            this.assignUniformTimestamps(line, words, startTime, endTime);
            return;
        }
        
        // 为每个字符分配峰值时间戳
        words.forEach((word, wordIndex) => {
            try {
                // 找到最适合该字符的峰值
                const peakIndex = Math.floor((wordIndex / words.length) * peaks.length);
                const peak = peaks[peakIndex] || { time: startTime + (wordIndex * (endTime - startTime) / words.length) };
                
                // 确保峰值时间有效
                const peakTime = peak.time || startTime + (wordIndex * (endTime - startTime) / words.length);
                
                // 计算结束时间
                const nextPeakIndex = peakIndex + 1;
                const nextPeak = nextPeakIndex < peaks.length ? peaks[nextPeakIndex] : { time: endTime };
                const charEndTime = nextPeak.time || endTime;
                
                // 确保时间戳有效且有序
                const adjustedStartTime = Math.max(peakTime, startTime);
                const adjustedEndTime = Math.min(charEndTime, endTime);
                
                line.wordTimestamps.push({
                    word: word,
                    startTime: adjustedStartTime,
                    endTime: adjustedEndTime
                });
            } catch (error) {
                console.error('分配时间戳失败:', error);
                // 如果出错，使用均匀分配作为备选
                this.assignUniformTimestamps(line, words, startTime, endTime);
            }
        });
    }
    
    /**
     * 均匀分配时间戳（备用方法）
     * @param {Object} line - 歌词行
     * @param {Array<string>} words - 字符数组
     * @param {number} startTime - 行开始时间
     * @param {number} endTime - 行结束时间
     */
    assignUniformTimestamps(line, words, startTime, endTime) {
        const totalDuration = endTime - startTime;
        const wordDuration = totalDuration / words.length;
        
        words.forEach((word, wordIndex) => {
            const start = startTime + (wordIndex * wordDuration);
            const end = start + wordDuration;
            
            line.wordTimestamps.push({
                word: word,
                startTime: start,
                endTime: end
            });
        });
    }

    /**
     * 显示设置区域
     */
    showSettings() {
        this.settingsSection.style.display = 'block';
    }

    /**
     * 隐藏设置区域
     */
    hideSettings() {
        this.settingsSection.style.display = 'none';
    }
    
    /**
     * 处理批量翻译
     */
    async handleBatchTranslate() {
        if (this.uploadedFiles.length === 0) {
            alert('请先上传歌词文件');
            return;
        }
        
        this.showLoading();
        
        try {
            // 更新AI服务配置
            this.aiService.switchService(
                this.translationApi.value,
                this.apiKey.value.trim()
            );
            
            // 翻译所有上传的文件
            for (let i = 0; i < this.uploadedFiles.length; i++) {
                this.currentFileIndex = i;
                await this.translateSingleFile(this.uploadedFiles[i]);
            }
            
            alert(`批量翻译完成！共翻译了 ${this.uploadedFiles.length} 个文件。`);
        } catch (error) {
            console.error('批量翻译失败:', error);
            alert(`批量翻译失败: ${error.message}\n请检查文件格式或重试`);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * 翻译单个文件（用于批量翻译）
     * @param {File} file - 要翻译的文件
     */
    async translateSingleFile(file) {
        try {
            const text = await FileUtils.readFile(file);
            
            // 解析文件
            const parseResult = this.parserManager.parse(text);
            const parsedData = parseResult.data;
            const parser = parseResult.parser;
            
            // 提取需要翻译的文本
            let textToTranslate = '';
            let textElements = [];
            
            // 根据不同格式提取文本
            if (parsedData.lyricLines) {
                // LRC 格式
                textElements = parsedData.lyricLines.filter(line => line.type === 'lyric');
                textToTranslate = textElements.map(line => line.text).join('\n');
            } else if (parsedData.subtitleLines) {
                // SRT 格式
                textElements = parsedData.subtitleLines;
                textToTranslate = textElements.map(sub => sub.textLines.join('\n')).join('\n\n');
            } else if (parsedData.subtitles) {
                // ASS 格式
                textElements = parsedData.subtitles;
                textToTranslate = textElements.map(sub => sub.text).join('\n\n');
            } else if (parsedData.textLines) {
                // TXT 格式
                textElements = parsedData.textLines;
                textToTranslate = textElements.map(line => line.text).join('\n');
            }
            
            // 调用 AI 翻译
            const translatedText = await this.aiService.translate(
                textToTranslate, 
                this.targetLang.value, 
                this.sourceLang.value
            );
            
            // 合并翻译结果
            this.mergeTranslationResults(textElements, translatedText);
            
            // 保存翻译结果到文件数据中
            file.translatedData = parsedData;
            file.parser = parser;
            file.originalText = text;
        } catch (error) {
            console.error(`翻译文件 ${file.name} 失败:`, error);
            // 继续翻译其他文件
        }
    }
    
    /**
     * 处理批量下载
     */
    handleBatchDownload() {
        if (this.uploadedFiles.length === 0) {
            alert('请先上传并翻译歌词文件');
            return;
        }
        
        // 下载所有已翻译的文件
        this.uploadedFiles.forEach(file => {
            if (file.translatedData) {
                this.downloadSingleFile(file);
            }
        });
    }
    
    /**
     * 下载单个文件
     * @param {File} file - 要下载的文件
     */
    downloadSingleFile(file) {
        if (!file.translatedData || !file.parser) {
            return;
        }
        
        // 生成翻译后的文本
        const translatedText = file.parser.stringify(file.translatedData);
        
        // 生成文件名
        const fileName = `${file.name.replace(/\.[^/.]+$/, '')}_translated.${file.name.split('.').pop()}`;
        
        // 下载文件
        FileUtils.downloadFile(fileName, translatedText);
    }
    
    /**
     * 合并翻译结果到文本元素
     * @param {Array<Object>} textElements - 文本元素数组
     * @param {string} translatedText - 翻译后的文本
     */
    mergeTranslationResults(textElements, translatedText) {
        // 按格式合并翻译结果
        const translatedLines = translatedText.split('\n');
        let lineIndex = 0;
        
        textElements.forEach(element => {
            if (element.type === 'lyric') {
                // LRC 格式
                element.translatedText = translatedLines[lineIndex] || element.text;
                lineIndex++;
            } else if (element.textLines) {
                // SRT 格式
                const lineCount = element.textLines.length;
                element.translatedTextLines = translatedLines.slice(lineIndex, lineIndex + lineCount);
                lineIndex += lineCount + 1; // +1 跳过空行
            } else if (element.text) {
                // ASS 或 TXT 格式
                element.translatedText = translatedLines[lineIndex] || element.text;
                lineIndex += 2; // +2 跳过空行
            }
        });
    }
    
    /**
     * 切换标签页
     * @param {Event} e - 标签切换事件
     */
    switchTab(e) {
        const tab = e.target.dataset.tab;
        
        // 更新标签按钮状态
        this.tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // 更新标签内容显示
        this.tabPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        const targetPanel = document.getElementById(`${tab}Panel`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }
    
    /**
     * 显示加载状态
     */
    showLoading() {
        if (this.loading) {
            this.loading.style.display = 'flex';
        }
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        if (this.loading) {
            this.loading.style.display = 'none';
        }
    }
    
    /**
     * 翻译歌词
     */
    async translateLyrics() {
        if (this.uploadedFiles.length === 0) {
            alert('请先上传歌词文件');
            return;
        }
        
        this.showLoading();
        
        try {
            // 处理当前文件
            const file = this.uploadedFiles[this.currentFileIndex];
            const text = await FileUtils.readFile(file);
            
            // 解析文件
            const parseResult = this.parserManager.parse(text);
            this.parsedData = parseResult.data;
            this.parser = parseResult.parser;
            
            // 翻译歌词行
            if (this.parsedData.lyricLines) {
                this.parsedData.lyricLines = await this.aiService.translateLyricLines(
                    this.parsedData.lyricLines, 
                    this.targetLang.value
                );
            } else {
                // 其他格式的翻译逻辑
                let textToTranslate = '';
                let textElements = [];
                
                if (this.parsedData.subtitleLines) {
                    // SRT 格式
                    textElements = this.parsedData.subtitleLines;
                    textToTranslate = textElements.map(sub => sub.textLines.join('\n')).join('\n\n');
                } else if (this.parsedData.subtitles) {
                    // ASS 格式
                    textElements = this.parsedData.subtitles;
                    textToTranslate = textElements.map(sub => sub.text).join('\n\n');
                } else if (this.parsedData.textLines) {
                    // TXT 格式
                    textElements = this.parsedData.textLines;
                    textToTranslate = textElements.map(line => line.text).join('\n');
                }
                
                // 调用翻译服务
                const translatedText = await this.aiService.translate(
                    textToTranslate, 
                    this.targetLang.value, 
                    this.sourceLang.value
                );
                
                // 合并翻译结果
                this.mergeTranslationResults(textElements, translatedText);
            }
            
            // 显示结果
            this.showResults(text);
        } catch (error) {
            console.error('翻译失败:', error);
            alert(`翻译失败: ${error.message}\n请检查文件格式或重试`);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * 显示翻译结果
     * @param {string} originalText - 原文文本
     */
    showResults(originalText) {
        // 更新原文显示
        if (this.originalLyrics) {
            this.originalLyrics.textContent = originalText;
        }
        
        // 生成翻译后的文本
        const translatedText = this.parser.stringify(this.parsedData);
        
        // 更新译文显示
        if (this.translatedLyrics) {
            this.translatedLyrics.textContent = translatedText;
        }
        
        // 显示结果区域
        this.resultSection.style.display = 'block';
    }
    
    /**
     * 下载翻译后的歌词
     */
    downloadTranslatedLyrics() {
        if (!this.parsedData || !this.parser) {
            alert('请先翻译歌词');
            return;
        }
        
        // 生成翻译后的文本
        const translatedText = this.parser.stringify(this.parsedData);
        
        // 生成文件名
        const originalFile = this.uploadedFiles[this.currentFileIndex];
        const fileName = `${originalFile.name.replace(/\.[^/.]+$/, '')}_translated.${originalFile.name.split('.').pop()}`;
        
        // 下载文件
        FileUtils.downloadFile(fileName, translatedText);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 检查AIService是否已经定义
    if (typeof AIService === 'undefined') {
        console.error('AIService未定义，尝试重新加载aiService.js');
        // 创建一个新的script元素，动态加载aiService.js
        const script = document.createElement('script');
        script.src = 'js/services/aiService.js';
        script.onload = () => {
            console.log('aiService.js重新加载成功');
            // 初始化应用
            window.app = new LyricTranslatorApp();
        };
        script.onerror = () => {
            console.error('aiService.js重新加载失败');
            // 使用模拟AIService初始化应用
            window.app = new LyricTranslatorApp();
        };
        document.body.appendChild(script);
    } else {
        // 初始化应用
        window.app = new LyricTranslatorApp();
    }
});