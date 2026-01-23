/**
 * 综合翻译功能测试脚本
 * 用于测试翻译功能的完整性、稳定性和边界情况
 */

const AIService = require('./js/services/aiService');

// 创建AI服务实例
const aiService = new AIService({
    appid: '20251221002524051',
    secretKey: 'tuvZN9D5mU7MtYcCPreF'
});

// 测试配置
const testConfig = {
    delay: 500 // 测试间隔（毫秒）
};

/**
 * 延迟函数
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise} - 延迟Promise
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 测试边界情况
 */
async function testEdgeCases() {
    console.log('开始测试边界情况...');
    console.log('='.repeat(80));
    
    const edgeCases = [
        { name: '空字符串', text: '', expected: '' },
        { name: '只包含空白字符', text: '   \n   \t   ', expected: '' },
        { name: 'null值', text: null, expected: '' },
        { name: 'undefined值', text: undefined, expected: '' },
        { name: '数字', text: 12345, expected: '' },
        { name: '布尔值', text: true, expected: '' },
        { name: '对象', text: { key: 'value' }, expected: '' },
        { name: '数组', text: ['hello', 'world'], expected: '' }
    ];
    
    let passedTests = 0;
    let totalTests = edgeCases.length;
    
    for (const testCase of edgeCases) {
        console.log(`测试: ${testCase.name}`);
        console.log(`输入: ${JSON.stringify(testCase.text)}`);
        
        try {
            const result = await aiService.translate(testCase.text, 'zh');
            const passed = result === testCase.expected;
            
            console.log(`预期结果: ${JSON.stringify(testCase.expected)}`);
            console.log(`实际结果: ${JSON.stringify(result)}`);
            console.log(`测试结果: ${passed ? '通过 ✓' : '失败 ✗'}`);
            
            if (passed) {
                passedTests++;
            }
        } catch (error) {
            console.error(`测试失败: ${error.message}`);
        }
        
        console.log('');
        await delay(testConfig.delay);
    }
    
    console.log(`边界情况测试结果: ${passedTests}/${totalTests} 通过`);
    console.log('='.repeat(80));
    
    return passedTests === totalTests;
}

/**
 * 测试长文本翻译
 */
async function testLongTextTranslation() {
    console.log('开始测试长文本翻译...');
    console.log('='.repeat(80));
    
    // 生成长文本
    const longText = 'Hello world! This is a test. '.repeat(50);
    console.log(`长文本长度: ${longText.length} 字符`);
    console.log(`前100个字符: ${longText.substring(0, 100)}...`);
    
    try {
        const startTime = Date.now();
        const result = await aiService.translate(longText, 'zh');
        const endTime = Date.now();
        
        console.log(`翻译结果长度: ${result.length} 字符`);
        console.log(`前100个字符: ${result.substring(0, 100)}...`);
        console.log(`响应时间: ${endTime - startTime}ms`);
        console.log('长文本翻译测试: 通过 ✓');
        
        await delay(testConfig.delay);
        return true;
    } catch (error) {
        console.error(`长文本翻译测试失败: ${error.message}`);
        await delay(testConfig.delay);
        return false;
    }
}

/**
 * 测试多语言翻译
 */
async function testMultilingualSupport() {
    console.log('开始测试多语言翻译支持...');
    console.log('='.repeat(80));
    
    const testLanguages = [
        { code: 'en', name: 'English', text: 'Hello world!', target: 'zh' },
        { code: 'zh', name: 'Chinese', text: '你好世界！', target: 'en' },
        { code: 'ja', name: 'Japanese', text: 'こんにちは世界！', target: 'zh' },
        { code: 'ko', name: 'Korean', text: '안녕하세요 세계!', target: 'zh' },
        { code: 'fr', name: 'French', text: 'Bonjour le monde!', target: 'zh' },
        { code: 'de', name: 'German', text: 'Hallo Welt!', target: 'zh' },
        { code: 'es', name: 'Spanish', text: '¡Hola mundo!', target: 'zh' },
        { code: 'ru', name: 'Russian', text: 'Привет мир!', target: 'zh' }
    ];
    
    let passedTests = 0;
    let totalTests = testLanguages.length;
    
    for (const testCase of testLanguages) {
        console.log(`测试 ${testCase.name} → 中文`);
        console.log(`输入: ${testCase.text}`);
        
        try {
            const startTime = Date.now();
            const result = await aiService.translate(testCase.text, testCase.target, testCase.code);
            const endTime = Date.now();
            
            console.log(`翻译结果: ${result}`);
            console.log(`响应时间: ${endTime - startTime}ms`);
            console.log(`测试结果: 通过 ✓`);
            
            passedTests++;
        } catch (error) {
            console.error(`测试失败: ${error.message}`);
        }
        
        console.log('');
        await delay(testConfig.delay);
    }
    
    console.log(`多语言翻译测试结果: ${passedTests}/${totalTests} 通过`);
    console.log('='.repeat(80));
    
    return passedTests === totalTests;
}

/**
 * 测试翻译结果质量
 */
async function testTranslationQuality() {
    console.log('开始测试翻译结果质量...');
    console.log('='.repeat(80));
    
    const qualityTests = [
        {
            name: '日语翻译质量',
            text: 'こんにちは世界！これはテストです。',
            sourceLang: 'ja',
            targetLang: 'zh',
            expectedKeywords: ['你好', '世界', '测试']
        },
        {
            name: '韩语翻译质量',
            text: '안녕하세요 세계! 이것은 테스트입니다.',
            sourceLang: 'ko',
            targetLang: 'zh',
            expectedKeywords: ['你好', '世界', '测试']
        },
        {
            name: '法语翻译质量',
            text: 'Bonjour le monde! Ceci est un test.',
            sourceLang: 'fr',
            targetLang: 'zh',
            expectedKeywords: ['你好', '世界', '测试']
        }
    ];
    
    let passedTests = 0;
    let totalTests = qualityTests.length;
    
    for (const testCase of qualityTests) {
        console.log(`测试: ${testCase.name}`);
        console.log(`输入: ${testCase.text}`);
        
        try {
            const result = await aiService.translate(testCase.text, testCase.targetLang, testCase.sourceLang);
            console.log(`翻译结果: ${result}`);
            
            // 检查是否包含预期关键词
            const containsAllKeywords = testCase.expectedKeywords.every(keyword => 
                result.includes(keyword)
            );
            
            console.log(`预期关键词: ${testCase.expectedKeywords.join(', ')}`);
            console.log(`测试结果: ${containsAllKeywords ? '通过 ✓' : '失败 ✗'}`);
            
            if (containsAllKeywords) {
                passedTests++;
            }
        } catch (error) {
            console.error(`测试失败: ${error.message}`);
        }
        
        console.log('');
        await delay(testConfig.delay);
    }
    
    console.log(`翻译质量测试结果: ${passedTests}/${totalTests} 通过`);
    console.log('='.repeat(80));
    
    return passedTests === totalTests;
}

/**
 * 运行综合测试
 */
async function runComprehensiveTests() {
    console.log('开始综合翻译功能测试...');
    console.log('='.repeat(80));
    console.log('测试目标: 验证翻译功能的完整性、稳定性和边界情况处理');
    console.log('='.repeat(80));
    
    const testResults = [];
    
    // 测试边界情况
    console.log('1. 测试边界情况');
    const edgeCasesResult = await testEdgeCases();
    testResults.push({
        name: '边界情况测试',
        passed: edgeCasesResult
    });
    
    // 测试长文本翻译
    console.log('2. 测试长文本翻译');
    const longTextResult = await testLongTextTranslation();
    testResults.push({
        name: '长文本翻译测试',
        passed: longTextResult
    });
    
    // 测试多语言翻译
    console.log('3. 测试多语言翻译');
    const multilingualResult = await testMultilingualSupport();
    testResults.push({
        name: '多语言翻译测试',
        passed: multilingualResult
    });
    
    // 测试翻译结果质量
    console.log('4. 测试翻译结果质量');
    const qualityResult = await testTranslationQuality();
    testResults.push({
        name: '翻译质量测试',
        passed: qualityResult
    });
    
    // 生成测试报告
    console.log('='.repeat(80));
    console.log('综合测试报告:');
    console.log('='.repeat(80));
    
    let passedTests = 0;
    let totalTests = testResults.length;
    
    testResults.forEach(result => {
        console.log(`${result.name}: ${result.passed ? '通过 ✓' : '失败 ✗'}`);
        if (result.passed) {
            passedTests++;
        }
    });
    
    console.log('='.repeat(80));
    console.log(`总体测试结果: ${passedTests}/${totalTests} 通过`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('='.repeat(80));
    
    if (passedTests === totalTests) {
        console.log('🎉 所有测试通过！翻译功能运行正常。');
    } else {
        console.log('⚠️  部分测试失败，请检查错误信息并修复问题。');
    }
    
    console.log('='.repeat(80));
    console.log('综合测试完成!');
    console.log('='.repeat(80));
    
    return passedTests === totalTests;
}

// 运行测试
runComprehensiveTests().catch(error => {
    console.error('综合测试失败:', error);
});
