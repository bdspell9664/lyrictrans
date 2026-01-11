/**
 * 百度翻译API测试脚本
 * 用于测试翻译功能是否正常工作
 */

// 导入AI服务
const AIService = require('./js/services/aiService');

// 创建AI服务实例
const aiService = new AIService({
    appid: '20251221002524051',
    secretKey: 'tuvZN9D5mU7MtYcCPreF'
});

// 测试文本
const testText = `つまらないな
嗚呼いつもの様に
でもそれでいい
嗚呼いつもの様に
そんなもんさ
嗚呼いつもの様に
これでいい
嗚呼いつもの様に
知らず知らず隠してた
嗚呼いつもの様に

本当の声を響かせてよほら
嗚呼いつもの様に
見ないフリしていても
嗚呼いつもの様に
確かにそこにある`;

// 测试翻译功能
async function testTranslation() {
    console.log('开始测试翻译功能...');
    console.log('测试文本:', testText);
    
    try {
        const translatedText = await aiService.translate(testText, 'zh-CN', 'ja');
        console.log('\n翻译结果:');
        console.log(translatedText);
        console.log('\n翻译成功!');
    } catch (error) {
        console.error('\n翻译失败:', error.message);
        console.error('完整错误:', error);
    }
}

// 运行测试
testTranslation();