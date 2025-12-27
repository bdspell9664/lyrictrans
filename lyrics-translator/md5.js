/**
 * 简单可靠的MD5实现
 * 用于百度翻译API签名生成
 */

/**
 * MD5哈希函数
 * @param {string} str - 要哈希的字符串
 * @returns {string} - MD5哈希值
 */
function md5(str) {
    // 使用Node.js内置的crypto模块
    const crypto = require('crypto');
    
    // 创建MD5哈希对象
    const hash = crypto.createHash('md5');
    
    // 更新哈希数据
    hash.update(str, 'utf8');
    
    // 计算哈希值
    return hash.digest('hex');
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = md5;
} else {
    // 浏览器环境全局导出
    window.md5 = md5;
}