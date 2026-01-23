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
    
    // 设置CORS头
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Max-Age': '86400'
    };
    
    // 处理OPTIONS请求（CORS预检）
    if (event.request.method === 'OPTIONS') {
        event.respondWith(
            new Response(null, {
                status: 204,
                headers: corsHeaders
            })
        );
        return;
    }
    
    // 处理GET请求（健康检查）
    if (url.pathname === PROXY_ENDPOINT && event.request.method === 'GET') {
        event.respondWith(
            new Response(JSON.stringify({
                status: 'ok',
                message: 'Proxy server is running',
                timestamp: new Date().toISOString()
            }), {
                status: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            })
        );
        return;
    }
    
    // 处理HEAD请求（健康检查）
    if (url.pathname === PROXY_ENDPOINT && event.request.method === 'HEAD') {
        event.respondWith(
            new Response(null, {
                status: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                    'Server': 'LyricsTranslatorProxy/1.0'
                }
            })
        );
        return;
    }
    
    // 只处理代理端点的POST请求
    if (url.pathname === PROXY_ENDPOINT && event.request.method === 'POST') {
        event.respondWith(handleProxyRequest(event.request, corsHeaders));
    } else {
        // 其他请求直接返回
        event.respondWith(fetch(event.request));
    }
});

/**
 * 处理代理请求
 * @param {Request} request - 客户端请求
 * @param {Object} corsHeaders - CORS头信息
 * @returns {Promise<Response>} - 代理响应
 */
async function handleProxyRequest(request, corsHeaders) {
    try {
        // 解析请求体
        let requestBody;
        const contentType = request.headers.get('content-type');
        
        if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            requestBody = Object.fromEntries(formData.entries());
        } else if (contentType && contentType.includes('application/json')) {
            requestBody = await request.json();
        } else {
            // 尝试解析为文本
            const text = await request.text();
            // 尝试解析为URLSearchParams
            requestBody = Object.fromEntries(new URLSearchParams(text).entries());
        }
        
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
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ 
            error: 'Proxy request failed', 
            details: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }
}
