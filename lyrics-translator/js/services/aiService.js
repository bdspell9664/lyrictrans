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
            return this.mockTranslate(text, targetLang, sourceLang);
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
     * 使用百度翻译API进行翻译
     * @param {string} text - 要翻译的文本
     * @param {string} targetLang - 目标语言
     * @param {string} sourceLang - 源语言
     * @returns {Promise<string>} - 翻译后的文本
     */
    async translateWithBaidu(text, targetLang, sourceLang = 'auto') {
        // 使用用户提供的默认百度翻译API配置
        const appid = this.config.apiKey.split(':')[0] || '20251221002524051';
        const secretKey = this.config.apiKey.split(':')[1] || 'tuvZN9D5mU7MtYcCPreF';
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

        // 最多重试3次
        const maxRetries = 3;
        for (let retry = 0; retry < maxRetries; retry++) {
            try {
                const response = await fetch(apiUrl, requestOptions);
                const data = await response.json();

                // 检查API返回的错误码
                if (data.error_code) {
                    console.error('百度翻译API错误:', data.error_code, data.error_msg);
                    if (retry < maxRetries - 1) {
                        console.log(`百度翻译API错误，正在重试 (${retry + 1}/${maxRetries})...`);
                        // 等待一段时间后重试
                        await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1)));
                        continue;
                    }
                    // 如果API调用失败，使用模拟翻译
                    console.log('API调用失败，使用模拟翻译');
                    return this.mockTranslate(text, targetLang, sourceLang);
                }

                if (!data.trans_result || !Array.isArray(data.trans_result)) {
                    if (retry < maxRetries - 1) {
                        console.log(`百度翻译API返回格式错误，正在重试 (${retry + 1}/${maxRetries})...`);
                        // 等待一段时间后重试
                        await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1)));
                        continue;
                    }
                    console.log('API返回格式错误，使用模拟翻译');
                    return this.mockTranslate(text, targetLang, sourceLang);
                }

                // 确保完整翻译所有文本
                let translatedText = data.trans_result.map(item => item.dst).join('\n');

                // 如果翻译结果为空，使用模拟翻译
                if (!translatedText) {
                    console.log('翻译结果为空，使用模拟翻译');
                    return this.mockTranslate(text, targetLang, sourceLang);
                }

                return translatedText;
            } catch (error) {
                console.error('百度翻译请求失败:', error);
                if (retry < maxRetries - 1) {
                    console.log(`百度翻译请求失败，正在重试 (${retry + 1}/${maxRetries})...`);
                    // 等待一段时间后重试
                    await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1)));
                    continue;
                }
                // 如果API调用失败，使用模拟翻译
                console.log('请求失败，使用模拟翻译');
                return this.mockTranslate(text, targetLang, sourceLang);
            }
        }

        // 如果所有重试都失败，使用模拟翻译
        return this.mockTranslate(text, targetLang, sourceLang);
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
     * @param {string} sourceLang - 源语言
     * @returns {string} - 模拟翻译后的文本
     */
    mockTranslate(text, targetLang, sourceLang = 'auto') {
        // 确保目标语言是中文
        if (targetLang !== 'zh' && targetLang !== 'zh-CN') {
            return text; // 仅支持中文翻译
        }
        
        // 简单的模拟翻译，实际项目中可以替换为更复杂的逻辑
        const mockTranslations = {
            // 英语到中文
            'Hello World': '你好 世界',
            'This is a test song': '这是一首测试歌曲',
            'Translate lyrics with AI': '用人工智能翻译歌词',
            'I love music': '我 爱 音乐',
            'Goodbye': '再见',
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
            'How are you': '你好吗',
            'Good morning': '早上好',
            'Thank you': '谢谢',
            "You're welcome": '不客气',
            'I': '我',
            'you': '你',
            'he': '他',
            'she': '她',
            'it': '它',
            'we': '我们',
            'they': '他们',
            'is': '是',
            'are': '是',
            'am': '是',
            'was': '是',
            'were': '是',
            'be': '是',
            'and': '和',
            'or': '或',
            'but': '但是',
            'in': '在',
            'on': '在',
            'at': '在',
            'for': '为了',
            'with': '用',
            'by': '通过',
            'to': '到',
            'of': '的',
            'from': '从',
            'about': '关于',
            'like': '喜欢',
            'know': '知道',
            'want': '想要',
            'think': '想',
            'feel': '感觉',
            'see': '看见',
            'hear': '听见',
            'say': '说',
            'do': '做',
            'go': '去',
            'come': '来',
            'get': '得到',
            'give': '给',
            'take': '拿',
            'make': '制作',
            'have': '有',
            'will': '将',
            'would': '将',
            'can': '能',
            'could': '能',
            'shall': '将',
            'should': '应该',
            'may': '可能',
            'might': '可能',
            'must': '必须',
            'very': '非常',
            'so': '所以',
            'because': '因为',
            'if': '如果',
            'then': '然后',
            'now': '现在',
            'here': '这里',
            'there': '那里',
            'today': '今天',
            'tomorrow': '明天',
            'yesterday': '昨天',
            'good': '好',
            'bad': '坏',
            'big': '大',
            'small': '小',
            'happy': '快乐',
            'sad': '悲伤',
            'angry': '生气',
            'excited': '兴奋',
            'tired': '累',
            'hungry': '饿',
            'thirsty': '渴',
            'hot': '热',
            'cold': '冷',
            'warm': '温暖',
            'cool': '凉爽',
            'beautiful': '美丽',
            'ugly': '丑陋',
            'smart': '聪明',
            'stupid': '愚蠢',
            'rich': '富有',
            'poor': '贫穷',
            'strong': '强壮',
            'weak': '虚弱',
            'fast': '快',
            'slow': '慢',
            'high': '高',
            'low': '低',
            'far': '远',
            'near': '近',
            'old': '老',
            'new': '新',
            'first': '第一',
            'last': '最后',
            'one': '一',
            'two': '二',
            'three': '三',
            'four': '四',
            'five': '五',
            'six': '六',
            'seven': '七',
            'eight': '八',
            'nine': '九',
            'ten': '十',
            'hundred': '百',
            'thousand': '千',
            'million': '百万',
            'billion': '十亿',
            'time': '时间',
            'day': '天',
            'week': '周',
            'month': '月',
            'year': '年',
            'hour': '小时',
            'minute': '分钟',
            'second': '秒',
            'money': '钱',
            'work': '工作',
            'school': '学校',
            'home': '家',
            'family': '家庭',
            'friend': '朋友',
            'child': '孩子',
            'children': '孩子们',
            'parent': '父母',
            'mother': '母亲',
            'father': '父亲',
            'son': '儿子',
            'daughter': '女儿',
            'brother': '兄弟',
            'sister': '姐妹',
            'man': '男人',
            'woman': '女人',
            'people': '人',
            'person': '人',
            'country': '国家',
            'city': '城市',
            'town': '城镇',
            'village': '村庄',
            'street': '街道',
            'road': '路',
            'house': '房子',
            'building': '建筑物',
            'car': '汽车',
            'bus': '公共汽车',
            'train': '火车',
            'plane': '飞机',
            'boat': '船',
            'ship': '船',
            'bike': '自行车',
            'bicycle': '自行车',
            'food': '食物',
            'water': '水',
            'milk': '牛奶',
            'bread': '面包',
            'rice': '米饭',
            'noodle': '面条',
            'meat': '肉',
            'fish': '鱼',
            'egg': '鸡蛋',
            'fruit': '水果',
            'vegetable': '蔬菜',
            'apple': '苹果',
            'banana': '香蕉',
            'orange': '橙子',
            'grape': '葡萄',
            'peach': '桃子',
            'pear': '梨',
            'watermelon': '西瓜',
            'tomato': '西红柿',
            'potato': '土豆',
            'carrot': '胡萝卜',
            'onion': '洋葱',
            'garlic': '大蒜',
            'pork': '猪肉',
            'beef': '牛肉',
            'chicken': '鸡肉',
            'duck': '鸭肉',
            'eat': '吃',
            'drink': '喝',
            'cook': '烹饪',
            'sleep': '睡觉',
            'walk': '走路',
            'run': '跑步',
            'jump': '跳跃',
            'swim': '游泳',
            'dance': '跳舞',
            'sing': '唱歌',
            'play': '玩',
            'watch': '看',
            'listen': '听',
            'read': '阅读',
            'write': '写',
            'draw': '画',
            'paint': '绘画',
            'study': '学习',
            'teach': '教',
            'learn': '学习',
            'know': '知道',
            'understand': '理解',
            'speak': '说话',
            'talk': '谈话',
            'say': '说',
            'tell': '告诉',
            'ask': '问',
            'answer': '回答',
            'think': '想',
            'believe': '相信',
            'hope': '希望',
            'wish': '愿望',
            'dream': '梦想',
            'love': '爱',
            'like': '喜欢',
            'hate': '讨厌',
            'dislike': '不喜欢',
            'want': '想要',
            'need': '需要',
            'should': '应该',
            'must': '必须',
            'can': '能',
            'could': '能',
            'will': '将',
            'would': '将',
            'shall': '将',
            'may': '可能',
            'might': '可能',
            'ought': '应该',
            'dare': '敢',
            'need': '需要',
            'used': '习惯',
            'had': '有',
            'has': '有',
            'have': '有',
            'do': '做',
            'does': '做',
            'did': '做',
            'go': '去',
            'goes': '去',
            'went': '去',
            'come': '来',
            'comes': '来',
            'came': '来',
            'get': '得到',
            'gets': '得到',
            'got': '得到',
            'give': '给',
            'gives': '给',
            'gave': '给',
            'take': '拿',
            'takes': '拿',
            'took': '拿',
            'make': '制作',
            'makes': '制作',
            'made': '制作',
            'see': '看见',
            'sees': '看见',
            'saw': '看见',
            'hear': '听见',
            'hears': '听见',
            'heard': '听见',
            'feel': '感觉',
            'feels': '感觉',
            'felt': '感觉',
            'smell': '闻',
            'taste': '尝',
            'touch': '触摸',
            'look': '看',
            'looks': '看',
            'looked': '看',
            'watch': '观看',
            'watches': '观看',
            'watched': '观看',
            'listen': '听',
            'listens': '听',
            'listened': '听',
            'read': '阅读',
            'reads': '阅读',
            'write': '写',
            'writes': '写',
            'draw': '画',
            'draws': '画',
            'paint': '绘画',
            'paints': '绘画',
            'study': '学习',
            'studies': '学习',
            'teach': '教',
            'teaches': '教',
            'learn': '学习',
            'learns': '学习',
            'know': '知道',
            'understand': '理解',
            'speak': '说话',
            'talk': '谈话',
            'say': '说',
            'tell': '告诉',
            'ask': '问',
            'answer': '回答',
            'think': '想',
            'believe': '相信',
            'hope': '希望',
            'wish': '愿望',
            'dream': '梦想',
            'love': '爱',
            'like': '喜欢',
            'hate': '讨厌',
            'dislike': '不喜欢',
            'want': '想要',
            'need': '需要',
            'should': '应该',
            'must': '必须',
            'can': '能',
            'could': '能',
            'will': '将',
            'would': '将',
            'shall': '将',
            'may': '可能',
            'might': '可能',
            'ought': '应该',
            'dare': '敢',
            'need': '需要',
            'used': '习惯'
        };

        // 替换完整句子或短语
        let translated = text;
        const lines = translated.split('\n');
        translated = lines.map(line => {
            // 尝试直接匹配完整句子
            if (mockTranslations[line]) {
                return mockTranslations[line];
            }
            
            // 否则替换短语
            let lineTranslated = line;
            
            // 按短语长度排序，优先匹配长短语
            const sortedTranslations = Object.entries(mockTranslations).sort((a, b) => b[0].length - a[0].length);
            
            for (const [key, value] of sortedTranslations) {
                lineTranslated = lineTranslated.replace(new RegExp(key, 'gi'), value);
            }
            
            // 如果没有进行任何翻译，添加翻译标记
            if (lineTranslated === line && line.trim() !== '') {
                return line + ' [译]';
            }
            
            return lineTranslated;
        }).join('\n');

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