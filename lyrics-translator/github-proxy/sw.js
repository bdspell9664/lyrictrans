/**
 * Service Worker for Lyrics Translator Proxy
 * 用于处理GitHub Pages上的API请求代理
 */

// 百度翻译API URL
const BAIDU_TRANSLATE_API = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 代理端点
const PROXY_ENDPOINT = '/translate';

// 安装事件
self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

// 激活事件
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// 处理fetch请求
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // 只处理代理端点的请求
    if (url.pathname === PROXY_ENDPOINT && event.request.method === 'POST') {
        event.respondWith(handleProxyRequest(event.request));
    } else {
        // 其他请求直接返回
        event.respondWith(fetch(event.request));
    }
});

/**
 * 处理代理请求
 * @param {Request} request - 客户端请求
 * @returns {Promise<Response>} - 代理响应
 */
async function handleProxyRequest(request) {
    try {
        // 解析请求体
        const formData = await request.formData();
        const requestBody = Object.fromEntries(formData.entries());
        
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
        const baiduResponse = await fetch(baiduRequest);
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
        return new Response(JSON.stringify({ 
            error: 'Proxy request failed', 
            details: error.message 
        }), {
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        });
    }
}
