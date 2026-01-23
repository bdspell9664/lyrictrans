/**
 * API密钥管理器
 * 负责百度翻译API密钥的管理
 */
class ApiKeyManager {
    /**
     * 初始化API密钥管理器
     */
    constructor() {
        // 直接使用默认密钥，无需存储
    }

    /**
     * 获取API密钥
     * @returns {Object} - 包含appid和key的对象
     */
    getApiKey() {
        // 直接返回默认密钥，无需从存储中获取
        return {
            appid: '20251221002524051',
            key: 'tuvZN9D5mU7MtYcCPreF'
        };
    }

    /**
     * 保存API密钥（已移除，使用默认密钥）
     * @param {string} appid - 百度翻译APP ID
     * @param {string} key - 百度翻译密钥
     */
    saveApiKey(appid, key) {
        // 已移除，使用默认密钥
        console.warn('API密钥保存功能已移除，使用默认密钥');
    }

    /**
     * 清除保存的API密钥（已移除，使用默认密钥）
     */
    clearApiKey() {
        // 已移除，使用默认密钥
        console.warn('API密钥清除功能已移除，使用默认密钥');
    }
}