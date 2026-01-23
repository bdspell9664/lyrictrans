/**
 * 浏览器内代理服务
 * 实现浏览器内轻量级代理功能，作为本地代理服务器的备选方案
 */
class BrowserProxy {
    /**
     * 初始化浏览器内代理
     * @param {Object} config - 配置参数
     */
    constructor(config = {}) {
        this.config = {
            timeout: config.timeout || 10000, // 默认10秒超时
            retryCount: config.retryCount || 2, // 默认重试2次
            ...config
        };
        
        // 代理状态
        this.status = 'idle'; // idle, active, error
        this.lastRequestTime = 0;
        this.requestCount = 0;
    }
    
    /**
     * 获取代理状态
     * @returns {string} - 代理状态
     */
    getStatus() {
        return this.status;
    }
    
    /**
     * 重置代理状态
     */
    resetStatus() {
        this.status = 'idle';
    }
    
    /**
     * 发送请求（核心方法）
     * @param {string} url - 请求URL
     * @param {Object} options - 请求选项
     * @returns {Promise<Response>} - 请求响应
     */
    async fetch(url, options = {}) {
        this.status = 'active';
        this.lastRequestTime = Date.now();
        this.requestCount++;
        
        try {
            // 构造完整的请求选项
            const requestOptions = {
                timeout: this.config.timeout,
                credentials: 'include', // 包含凭据
                mode: 'cors', // 跨域请求
                ...options
            };
            
            // 使用原生fetch API发送请求
            const response = await this._fetchWithRetry(url, requestOptions);
            this.status = 'idle';
            return response;
        } catch (error) {
            console.error('浏览器内代理请求失败:', error);
            this.status = 'error';
            throw error;
        }
    }
    
    /**
     * 带重试机制的请求发送
     * @param {string} url - 请求URL
     * @param {Object} options - 请求选项
     * @param {number} retry - 当前重试次数
     * @returns {Promise<Response>} - 请求响应
     * @private
     */
    async _fetchWithRetry(url, options, retry = 0) {
        try {
            return await this._withTimeout(fetch(url, options), options.timeout);
        } catch (error) {
            if (retry < this.config.retryCount) {
                console.log(`请求失败，正在重试（${retry + 1}/${this.config.retryCount}）:`, error.message);
                // 指数退避策略
                const delay = Math.pow(2, retry) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return this._fetchWithRetry(url, options, retry + 1);
            }
            throw error;
        }
    }
    
    /**
     * 带超时处理的Promise
     * @param {Promise} promise - 要执行的Promise
     * @param {number} timeout - 超时时间（毫秒）
     * @returns {Promise<any>} - 执行结果
     * @private
     */
    async _withTimeout(promise, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const result = await promise;
            clearTimeout(timeoutId);
            return result;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`请求超时（${timeout}ms）`);
            }
            throw error;
        }
    }
    
    /**
     * 处理翻译请求
     * @param {string} text - 要翻译的文本
     * @param {string} from - 源语言代码
     * @param {string} to - 目标语言代码
     * @param {Object} extraData - 额外数据
     * @returns {Promise<Object>} - 翻译结果
     */
    async translate(text, from, to, extraData = {}) {
        // 百度翻译API直接地址
        const apiUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
        
        try {
            // 构建请求体
            const formData = new URLSearchParams();
            formData.append('q', text);
            formData.append('from', from);
            formData.append('to', to);
            formData.append('appid', extraData.appid || '');
            formData.append('salt', extraData.salt || Math.floor(Math.random() * 1000000000).toString());
            formData.append('sign', extraData.sign || '');
            
            // 发送请求
            const response = await this.fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': navigator.userAgent || 'LyricsTranslator/1.0'
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP请求失败，状态码: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('浏览器内代理翻译失败:', error);
            throw error;
        }
    }
    
    /**
     * 检查目标URL是否可访问
     * @param {string} url - 要检查的URL
     * @returns {Promise<boolean>} - 是否可访问
     */
    async checkUrlAccessibility(url) {
        try {
            const response = await this.fetch(url, {
                method: 'HEAD',
                mode: 'no-cors' // 允许跨域检查
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 获取代理统计信息
     * @returns {Object} - 统计信息
     */
    getStats() {
        return {
            status: this.status,
            lastRequestTime: this.lastRequestTime,
            requestCount: this.requestCount
        };
    }
    
    /**
     * 清理资源
     */
    cleanup() {
        this.resetStatus();
        this.requestCount = 0;
        console.log('浏览器内代理已清理');
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserProxy;
} else {
    // 浏览器环境全局导出
    window.BrowserProxy = BrowserProxy;
}
