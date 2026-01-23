/**
 * Cloudflare Workers 代理脚本
 * 用于处理百度翻译API请求，支持跨域访问
 * 可以部署到GitHub Pages或Cloudflare Workers
 */

/**
 * 处理请求的主函数
 * @param {Request} request - 接收到的请求对象
 * @returns {Promise<Response>} - 处理后的响应对象
 */
async function handleRequest(request) {
    // 允许所有来源的CORS请求
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // 处理OPTIONS请求
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: corsHeaders
        });
    }

    try {
        // 解析请求URL和参数
        const url = new URL(request.url);
        const path = url.pathname;
        const searchParams = url.search;
        
        // 根据路径路由请求
        if (path === '/translate') {
            // 处理百度翻译API请求
            return handleTranslateRequest(request, searchParams, corsHeaders);
        } else {
            // 处理其他请求
            return new Response('Not Found', {
                status: 404,
                headers: corsHeaders
            });
        }
    } catch (error) {
        // 处理错误
        return new Response(JSON.stringify({
            error: error.message
        }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }
}

/**
 * 处理百度翻译API请求
 * @param {Request} request - 原始请求
 * @param {string} searchParams - 查询参数
 * @param {Object} corsHeaders - CORS头信息
 * @returns {Promise<Response>} - 翻译响应
 */
async function handleTranslateRequest(request, searchParams, corsHeaders) {
    // 百度翻译API的基本URL
    const baiduApiUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
    
    // 构建完整的API请求URL
    const apiUrl = `${baiduApiUrl}${searchParams}`;
    
    // 获取原始请求的方法和头信息
    const method = request.method;
    const requestHeaders = new Headers(request.headers);
    
    // 删除可能导致问题的头信息
    requestHeaders.delete('Origin');
    requestHeaders.delete('Referer');
    
    // 获取请求体
    const body = await request.text();
    
    // 构建新的请求选项
    const requestOptions = {
        method: method,
        headers: requestHeaders,
        body: body
    };
    
    // 发送请求到百度翻译API
    const response = await fetch(apiUrl, requestOptions);
    
    // 读取响应体
    const responseBody = await response.text();
    
    // 复制响应头
    const responseHeaders = new Headers(response.headers);
    
    // 添加CORS头
    Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value);
    });
    
    // 设置内容类型
    responseHeaders.set('Content-Type', 'application/json');
    
    // 返回响应
    return new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
    });
}

// 导出主函数
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

/**
 * 部署说明：
 * 
 * 1. 部署到Cloudflare Workers：
 *    - 登录Cloudflare控制台
 *    - 导航到Workers & Pages
 *    - 点击"Create a Worker"
 *    - 粘贴此脚本
 *    - 点击"Deploy"
 *    - 获取生成的Worker URL
 *    - 在前端代码中使用此URL作为代理地址
 * 
 * 2. 部署到GitHub Pages：
 *    - 创建一个新的GitHub仓库
 *    - 将此脚本保存为`index.js`
 *    - 创建一个`package.json`文件，包含必要的依赖
 *    - 创建一个GitHub Actions工作流，用于部署到GitHub Pages
 *    - 使用GitHub Pages的URL作为代理地址
 * 
 * 3. 在前端代码中使用代理：
 *    - 将代理URL替换原来的百度翻译API地址
 *    - 例如：
 *      const proxyUrl = 'https://your-worker-name.your-account.workers.dev';
 *      const response = await fetch(`${proxyUrl}?q=${encodeURIComponent(text)}&from=${from}&to=${to}&appid=${appid}&salt=${salt}&sign=${sign}`);
 * 
 * 4. 注意事项：
 *    - 确保在Cloudflare Workers设置中允许所有来源的请求
 *    - 定期更新脚本，以适应百度翻译API的变化
 *    - 考虑添加请求限制，防止滥用
 */