/**
 * 多语言翻译测试脚本
 * 用于测试翻译功能对不同语言的支持
 */

const AIService = require('./js/services/aiService');

// 创建AI服务实例
const aiService = new AIService({
    appid: '20251221002524051',
    secretKey: 'tuvZN9D5mU7MtYcCPreF'
});

// 测试语言配置
const testLanguages = [
    { code: 'en', name: 'English', text: 'Hello world! This is a test.' },
    { code: 'zh', name: 'Chinese', text: '你好世界！这是一个测试。' },
    { code: 'ja', name: 'Japanese', text: 'こんにちは世界！これはテストです。' },
    { code: 'ko', name: 'Korean', text: '안녕하세요 세계! 이것은 테스트입니다.' },
    { code: 'fr', name: 'French', text: 'Bonjour le monde! Ceci est un test.' },
    { code: 'de', name: 'German', text: 'Hallo Welt! Dies ist ein Test.' },
    { code: 'es', name: 'Spanish', text: '¡Hola mundo! Esto es una prueba.' },
    { code: 'ru', name: 'Russian', text: 'Привет мир! Это тест.' }
];

// 目标语言
const targetLanguage = 'zh'; // 翻译成中文

/**
 * 测试多语言翻译
 */
async function testMultilingualTranslation() {
    console.log('开始多语言翻译测试...');
    console.log('='.repeat(80));
    console.log(`目标语言: ${targetLanguage} (中文)`);
    console.log('='.repeat(80));
    
    const results = [];
    
    for (const sourceLang of testLanguages) {
        console.log(`测试 ${sourceLang.name} → 中文:`);
        console.log(`原文: ${sourceLang.text}`);
        
        try {
            const startTime = Date.now();
            const translatedText = await aiService.translate(sourceLang.text, targetLanguage, sourceLang.code);
            const endTime = Date.now();
            
            console.log(`翻译结果: ${translatedText}`);
            console.log(`响应时间: ${endTime - startTime}ms`);
            console.log('测试成功 ✓');
            
            results.push({
                sourceLanguage: sourceLang.name,
                sourceCode: sourceLang.code,
                targetLanguage: 'Chinese',
                targetCode: targetLanguage,
                originalText: sourceLang.text,
                translatedText: translatedText,
                responseTime: endTime - startTime,
                success: true
            });
        } catch (error) {
            console.error(`测试失败 ✗: ${error.message}`);
            
            results.push({
                sourceLanguage: sourceLang.name,
                sourceCode: sourceLang.code,
                targetLanguage: 'Chinese',
                targetCode: targetLanguage,
                originalText: sourceLang.text,
                translatedText: '',
                responseTime: 0,
                success: false,
                error: error.message
            });
        }
        
        console.log('');
    }
    
    // 测试反向翻译（中文→其他语言）
    console.log('='.repeat(80));
    console.log('测试反向翻译（中文→其他语言）:');
    console.log('='.repeat(80));
    
    const chineseText = '你好世界！这是一个多语言翻译测试。';
    
    for (const targetLang of testLanguages.filter(lang => lang.code !== 'zh')) {
        console.log(`测试 中文 → ${targetLang.name}:`);
        console.log(`原文: ${chineseText}`);
        
        try {
            const startTime = Date.now();
            const translatedText = await aiService.translate(chineseText, targetLang.code, 'zh');
            const endTime = Date.now();
            
            console.log(`翻译结果: ${translatedText}`);
            console.log(`响应时间: ${endTime - startTime}ms`);
            console.log('测试成功 ✓');
            
            results.push({
                sourceLanguage: 'Chinese',
                sourceCode: 'zh',
                targetLanguage: targetLang.name,
                targetCode: targetLang.code,
                originalText: chineseText,
                translatedText: translatedText,
                responseTime: endTime - startTime,
                success: true
            });
        } catch (error) {
            console.error(`测试失败 ✗: ${error.message}`);
            
            results.push({
                sourceLanguage: 'Chinese',
                sourceCode: 'zh',
                targetLanguage: targetLang.name,
                targetCode: targetLang.code,
                originalText: chineseText,
                translatedText: '',
                responseTime: 0,
                success: false,
                error: error.message
            });
        }
        
        console.log('');
    }
    
    // 生成测试报告
    console.log('='.repeat(80));
    console.log('多语言翻译测试报告:');
    console.log('='.repeat(80));
    
    const successfulTests = results.filter(result => result.success);
    const failedTests = results.filter(result => !result.success);
    
    console.log(`总测试数: ${results.length}`);
    console.log(`成功测试: ${successfulTests.length} (${(successfulTests.length / results.length * 100).toFixed(1)}%)`);
    console.log(`失败测试: ${failedTests.length} (${(failedTests.length / results.length * 100).toFixed(1)}%)`);
    
    if (failedTests.length > 0) {
        console.log('\n失败的测试:');
        failedTests.forEach(test => {
            console.log(`${test.sourceLanguage} → ${test.targetLanguage}: ${test.error}`);
        });
    }
    
    console.log('\n成功的测试:');
    successfulTests.forEach(test => {
        console.log(`${test.sourceLanguage} → ${test.targetLanguage}: ${test.originalText} → ${test.translatedText}`);
    });
    
    console.log('='.repeat(80));
    console.log('多语言翻译测试完成!');
    console.log('='.repeat(80));
}

// 运行测试
testMultilingualTranslation().catch(error => {
    console.error('多语言翻译测试失败:', error);
});
