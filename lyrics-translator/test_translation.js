/**
 * 测试多行情歌翻译功能
 */

// 模拟浏览器环境的全局对象
if (typeof window === 'undefined') {
    global.window = {
        md5: () => {
            const crypto = require('crypto');
            return (str) => crypto.createHash('md5').update(str, 'utf8').digest('hex');
        }
    };
}

// 导入AIService类
const AIService = require('./js/services/aiService.js');

// 创建AIService实例
const aiService = new AIService();

// 测试用歌词行数据
const testLyricLines = [
    { type: 'info', text: '[ti:Test Song]' },
    { type: 'info', text: '[ar:Test Artist]' },
    { type: 'info', text: '[al:Test Album]' },
    { type: 'lyric', text: 'First line of the test song', timestamps: [{ totalMilliseconds: 0 }] },
    { type: 'lyric', text: 'Second line with different content', timestamps: [{ totalMilliseconds: 5000 }] },
    { type: 'lyric', text: 'Third line to test translation', timestamps: [{ totalMilliseconds: 10000 }] },
    { type: 'lyric', text: 'Fourth line with unique text', timestamps: [{ totalMilliseconds: 15000 }] },
    { type: 'lyric', text: 'Fifth and final line for testing', timestamps: [{ totalMilliseconds: 20000 }] }
];

/**
 * 测试多行情歌翻译
 */
async function testMultiLineTranslation() {
    console.log('=== 测试多行情歌翻译功能 ===');
    console.log('测试数据:', JSON.stringify(testLyricLines, null, 2));
    
    try {
        // 调用翻译方法
        const translatedResult = await aiService.translateLyricLines(testLyricLines, 'zh');
        
        console.log('\n=== 翻译结果 ===');
        
        // 检查翻译结果
        let success = true;
        for (let i = 0; i < translatedResult.length; i++) {
            const line = translatedResult[i];
            if (line.type === 'lyric') {
                console.log(`行 ${i}: 原文: "${line.text}" → 译文: "${line.translatedText}"`);
                
                // 检查是否所有行都被正确翻译
                if (line.translatedText === line.text) {
                    console.log(`❌ 警告: 第 ${i} 行没有被翻译`);
                    success = false;
                } else if (line.translatedText.includes('翻译失败')) {
                    console.log(`❌ 错误: 第 ${i} 行翻译失败: ${line.translatedText}`);
                    success = false;
                }
            }
        }
        
        console.log('\n=== 测试总结 ===');
        if (success) {
            console.log('✅ 测试通过: 所有歌词行都被正确翻译');
        } else {
            console.log('❌ 测试失败: 部分歌词行翻译有问题');
        }
        
        return success;
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        return false;
    }
}

/**
 * 测试单个翻译请求
 */
async function testSingleTranslation() {
    console.log('\n=== 测试单个翻译请求 ===');
    
    try {
        const textToTranslate = 'Hello world\nThis is a test';
        const translatedText = await aiService.translate(textToTranslate, 'zh');
        
        console.log('原文:', textToTranslate);
        console.log('译文:', translatedText);
        
        const lines = textToTranslate.split('\n');
        const translatedLines = translatedText.split('\n');
        
        if (lines.length === translatedLines.length) {
            console.log('✅ 测试通过: 翻译结果行数与原文一致');
        } else {
            console.log('❌ 测试失败: 翻译结果行数与原文不一致');
        }
        
        return true;
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        return false;
    }
}

// 运行测试
(async () => {
    console.log('开始测试歌词翻译功能...');
    
    const test1Result = await testMultiLineTranslation();
    const test2Result = await testSingleTranslation();
    
    console.log('\n=== 最终结果 ===');
    if (test1Result && test2Result) {
        console.log('🎉 所有测试通过! 歌词翻译功能正常工作');
    } else {
        console.log('💥 部分测试失败，请检查代码');
        process.exit(1);
    }
})();
