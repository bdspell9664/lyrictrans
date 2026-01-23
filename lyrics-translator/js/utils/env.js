/**
 * 环境检测工具
 * 用于检测当前运行环境，包括浏览器、Node.js、网络环境等
 */

class EnvDetector {
    /**
     * 检测当前环境是否为浏览器环境
     * @returns {boolean} - 是否为浏览器环境
     */
    static isBrowser() {
        return typeof window !== 'undefined' && typeof window.document !== 'undefined';
    }

    /**
     * 检测当前环境是否为Node.js环境
     * @returns {boolean} - 是否为Node.js环境
     */
    static isNode() {
        return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
    }

    /**
     * 检测当前浏览器类型和版本
     * @returns {Object} - 浏览器信息，包含name和version
     */
    static getBrowserInfo() {
        if (!this.isBrowser()) {
            return { name: 'node', version: process.version };
        }

        const userAgent = navigator.userAgent;
        let browserName = 'unknown';
        let browserVersion = 'unknown';

        // 检测浏览器类型
        if (userAgent.indexOf('Chrome') > -1) {
            browserName = 'chrome';
            browserVersion = userAgent.match(/Chrome\/(\d+\.\d+)/)[1];
        } else if (userAgent.indexOf('Firefox') > -1) {
            browserName = 'firefox';
            browserVersion = userAgent.match(/Firefox\/(\d+\.\d+)/)[1];
        } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
            browserName = 'safari';
            browserVersion = userAgent.match(/Version\/(\d+\.\d+)/)[1];
        } else if (userAgent.indexOf('Edge') > -1) {
            browserName = 'edge';
            browserVersion = userAgent.match(/Edge\/(\d+\.\d+)/)[1];
        } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
            browserName = 'ie';
            browserVersion = userAgent.match(/(MSIE|Trident).*?([0-9]+\.\d+)/)[2];
        }

        return { name: browserName, version: browserVersion };
    }

    /**
     * 检测当前网络环境
     * @returns {Object} - 网络信息，包含type和effectiveType
     */
    static getNetworkInfo() {
        if (!this.isBrowser() || !navigator.connection) {
            return { type: 'unknown', effectiveType: 'unknown' };
        }

        const connection = navigator.connection;
        return {
            type: connection.type || 'unknown',
            effectiveType: connection.effectiveType || 'unknown'
        };
    }

    /**
     * 检测浏览器是否支持Service Worker
     * @returns {boolean} - 是否支持Service Worker
     */
    static supportsServiceWorker() {
        return this.isBrowser() && 'serviceWorker' in navigator;
    }

    /**
     * 检测浏览器是否支持WebSocket
     * @returns {boolean} - 是否支持WebSocket
     */
    static supportsWebSocket() {
        return this.isBrowser() && 'WebSocket' in window;
    }

    /**
     * 检测浏览器是否支持CORS
     * @returns {boolean} - 是否支持CORS
     */
    static supportsCORS() {
        return this.isBrowser() && 'XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest();
    }

    /**
     * 检测本地代理服务器是否可用
     * @param {string} proxyUrl - 代理服务器URL
     * @returns {Promise<boolean>} - 代理服务器是否可用
     */
    static async isLocalProxyAvailable(proxyUrl = 'http://localhost:3001/translate') {
        if (!this.isBrowser()) {
            return true;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(proxyUrl, {
                method: 'HEAD',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * 检测代理API服务是否可用
     * @param {string} apiUrl - 代理API服务URL
     * @returns {Promise<boolean>} - 代理API服务是否可用
     */
    static async isProxyApiAvailable(apiUrl = 'http://localhost:3003/api/proxy/status') {
        if (!this.isBrowser()) {
            return true;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(apiUrl, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * 检测WebSocket服务是否可用
     * @param {string} wsUrl - WebSocket服务URL
     * @returns {Promise<boolean>} - WebSocket服务是否可用
     */
    static async isWebSocketAvailable(wsUrl = 'ws://localhost:3002') {
        if (!this.supportsWebSocket()) {
            return false;
        }

        return new Promise((resolve) => {
            const ws = new WebSocket(wsUrl);
            const timeoutId = setTimeout(() => {
                ws.close();
                resolve(false);
            }, 2000);

            ws.onopen = () => {
                clearTimeout(timeoutId);
                ws.close();
                resolve(true);
            };

            ws.onerror = () => {
                clearTimeout(timeoutId);
                ws.close();
                resolve(false);
            };

            ws.onclose = () => {
                clearTimeout(timeoutId);
                resolve(false);
            };
        });
    }

    /**
     * 获取当前环境配置
     * @returns {Object} - 环境配置，包含所有检测结果
     */
    static async getEnvConfig() {
        return {
            isBrowser: this.isBrowser(),
            isNode: this.isNode(),
            browserInfo: this.getBrowserInfo(),
            networkInfo: this.getNetworkInfo(),
            supportsServiceWorker: this.supportsServiceWorker(),
            supportsWebSocket: this.supportsWebSocket(),
            supportsCORS: this.supportsCORS(),
            isLocalProxyAvailable: await this.isLocalProxyAvailable(),
            isProxyApiAvailable: await this.isProxyApiAvailable(),
            isWebSocketAvailable: await this.isWebSocketAvailable()
        };
    }

    /**
     * 检测当前环境是否为开发环境
     * @returns {boolean} - 是否为开发环境
     */
    static isDevelopment() {
        if (this.isNode()) {
            return process.env.NODE_ENV === 'development';
        } else if (this.isBrowser()) {
            return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        }
        return false;
    }

    /**
     * 检测当前环境是否为生产环境
     * @returns {boolean} - 是否为生产环境
     */
    static isProduction() {
        return !this.isDevelopment();
    }

    /**
     * 获取当前运行环境的详细信息
     * @returns {Object} - 详细的环境信息
     */
    static async getDetailedInfo() {
        const envConfig = await this.getEnvConfig();
        
        return {
            ...envConfig,
            isDevelopment: this.isDevelopment(),
            isProduction: this.isProduction(),
            userAgent: this.isBrowser() ? navigator.userAgent : 'node',
            timestamp: new Date().toISOString()
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvDetector;
} else if (typeof window !== 'undefined') {
    window.EnvDetector = EnvDetector;
}
