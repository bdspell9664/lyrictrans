/**
 * 翻译功能性能测试脚本
 * 用于分析翻译功能的响应时间和稳定性
 */

const AIService = require('./js/services/aiService');

// 创建AI服务实例
const aiService = new AIService({
    appid: '20251221002524051',
    secretKey: 'tuvZN9D5mU7MtYcCPreF'
});

// 测试文本集合
const testTexts = {
    short: 'Hello world',
    medium: 'This is a medium length text for testing translation performance. It contains multiple sentences and some complex structures.',
    long: 'This is a long text for testing translation performance. '.repeat(10) + 'It contains many sentences and complex structures to test the translation service under load.',
    japanese: 'つまらないな\n嗚呼いつもの様に\nでもそれでいい\n嗚呼いつもの様に',
    chinese: '你好世界\n这是一段中文测试文本\n用于测试翻译功能的性能和稳定性'
};

// 测试配置
const testConfig = {
    iterations: 5, // 每个测试执行次数
    delay: 1000 // 测试间隔（毫秒）
};

/**
 * 测量翻译响应时间
 * @param {string} text - 测试文本
 * @param {string} targetLang - 目标语言
 * @param {string} sourceLang - 源语言
 * @returns {Promise<number>} - 响应时间（毫秒）
 */
async function measureTranslationTime(text, targetLang, sourceLang = 'auto') {
    const startTime = Date.now();
    try {
        await aiService.translate(text, targetLang, sourceLang);
        return Date.now() - startTime;
    } catch (error) {
        console.error('翻译测试失败:', error.message);
        return -1; // 错误标记
    }
}

/**
 * 运行性能测试
 */
async function runPerformanceTests() {
    console.log('开始翻译功能性能测试...');
    console.log('='.repeat(80));
    
    const testCases = [
        { name: '短文本 (英文→中文)', text: testTexts.short, target: 'zh-CN', source: 'en' },
        { name: '中等文本 (英文→中文)', text: testTexts.medium, target: 'zh-CN', source: 'en' },
        { name: '长文本 (英文→中文)', text: testTexts.long, target: 'zh-CN', source: 'en' },
        { name: '日语文本 (日语→中文)', text: testTexts.japanese, target: 'zh-CN', source: 'ja' },
        { name: '中文文本 (中文→英文)', text: testTexts.chinese, target: 'en', source: 'zh-CN' }
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
        console.log(`测试: ${testCase.name}`);
        console.log(`文本长度: ${testCase.text.length} 字符`);
        
        const times = [];
        let successCount = 0;
        
        for (let i = 0; i < testConfig.iterations; i++) {
            console.log(`  执行测试 ${i + 1}/${testConfig.iterations}...`);
            const time = await measureTranslationTime(testCase.text, testCase.target, testCase.source);
            
            if (time > 0) {
                times.push(time);
                successCount++;
                console.log(`  响应时间: ${time}ms`);
            } else {
                console.log(`  测试失败`);
            }
            
            // 测试间隔
            if (i < testConfig.iterations - 1) {
                await new Promise(resolve => setTimeout(resolve, testConfig.delay));
            }
        }
        
        // 计算统计数据
        if (times.length > 0) {
            const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);
            
            results.push({
                test: testCase.name,
                textLength: testCase.text.length,
                successRate: (successCount / testConfig.iterations) * 100,
                avgTime: avgTime,
                minTime: minTime,
                maxTime: maxTime,
                times: times
            });
            
            console.log(`  结果: 成功率 ${(successCount / testConfig.iterations) * 100}%, 平均响应时间 ${avgTime.toFixed(2)}ms, 最小 ${minTime}ms, 最大 ${maxTime}ms`);
        } else {
            console.log(`  结果: 所有测试失败`);
        }
        
        console.log('');
    }
    
    console.log('='.repeat(80));
    console.log('性能测试总结:');
    console.log('='.repeat(80));
    
    results.forEach(result => {
        console.log(`${result.test}:`);
        console.log(`  文本长度: ${result.textLength} 字符`);
        console.log(`  成功率: ${result.successRate.toFixed(1)}%`);
        console.log(`  平均响应时间: ${result.avgTime.toFixed(2)}ms`);
        console.log(`  响应时间范围: ${result.minTime}ms - ${result.maxTime}ms`);
        console.log(`  详细时间: ${result.times.join(', ')}ms`);
        console.log('');
    });
    
    // 计算整体性能指标
    const overallSuccessRate = results.reduce((sum, result) => sum + result.successRate, 0) / results.length;
    const overallAvgTime = results.reduce((sum, result) => sum + result.avgTime, 0) / results.length;
    
    console.log('='.repeat(80));
    console.log('整体性能指标:');
    console.log(`成功率: ${overallSuccessRate.toFixed(1)}%`);
    console.log(`平均响应时间: ${overallAvgTime.toFixed(2)}ms`);
    console.log('='.repeat(80));
    console.log('性能测试完成!');
}

// 运行测试
runPerformanceTests().catch(error => {
    console.error('性能测试失败:', error);
});
