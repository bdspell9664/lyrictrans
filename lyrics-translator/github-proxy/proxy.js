/**
 * Lyrics Translator Proxy - GitHub Pages 代理服务
 * 用于解决歌词翻译工具的跨域问题
 */

// 百度翻译API URL
const BAIDU_TRANSLATE_API = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 代理服务配置
const PROXY_CONFIG = {
    allowedOrigins: ['*'], // 允许所有来源，可根据需要限制
    maxRequestSize: 1024 * 1024, // 最大请求大小：1MB
    timeout: 15000 // 请求超时时间：15秒
};

/**
 * 处理跨域请求
 * @param {Request} request - 客户端请求
 * @returns {Response} - 代理响应
 */
async function handleRequest(request) {
    // 只允许POST请求
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Only POST requests are allowed' }), {
            status: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Content-Type': 'application/json'
            }
        });
    }

    // 解析请求体
    let requestBody;
    try {
        const contentType = request.headers.get('content-type');
        if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            requestBody = Object.fromEntries(formData.entries());
        } else {
            requestBody = await request.json();
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
            status: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        });
    }

    // 验证必要参数
    if (!requestBody.q || !requestBody.appid || !requestBody.salt || !requestBody.sign) {
        return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
            status: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        });
    }

    try {
        // 构建百度翻译API请求
        const baiduRequest = new Request(BAIDU_TRANSLATE_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'LyricsTranslatorProxy/1.0'
            },
            body: new URLSearchParams(requestBody)
        });

        // 发送请求到百度翻译API
        const baiduResponse = await fetch(baiduRequest, {
            redirect: 'follow',
            timeout: PROXY_CONFIG.timeout
        });

        // 解析响应
        const baiduData = await baiduResponse.json();

        // 返回响应给客户端
        return new Response(JSON.stringify(baiduData), {
            status: baiduResponse.status,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: 'Proxy request failed', details: error.message }), {
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        });
    }
}

/**
 * 初始化代理服务
 */
function initProxy() {
    // 检查是否支持Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
}

// 初始化代理服务
if (typeof window !== 'undefined') {
    // 浏览器环境
    document.addEventListener('DOMContentLoaded', initProxy);
} else if (typeof addEventListener === 'function') {
    // Cloudflare Workers或其他Serverless环境
    addEventListener('fetch', event => {
        event.respondWith(handleRequest(event.request));
    });
}