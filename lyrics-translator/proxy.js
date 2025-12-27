/**
 * 百度翻译API代理服务器
 * 解决前端跨域请求问题
 */

const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

// 配置
const PORT = 3001;
const BAIDU_API_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

/**
 * 创建代理服务器
 */
const server = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 只处理POST请求
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
        return;
    }
    
    // 解析URL
    const parsedUrl = url.parse(req.url);
    
    // 只处理翻译请求
    if (parsedUrl.pathname !== '/translate') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
    }
    
    // 收集请求体
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            // 解析请求参数
            const params = querystring.parse(body);
            
            // 构建百度API请求参数
            const apiParams = {
                q: params.q || '',
                from: params.from || 'auto',
                to: params.to || 'zh',
                appid: params.appid || '',
                salt: params.salt || '',
                sign: params.sign || ''
            };
            
            // 转发请求到百度API
            const postData = querystring.stringify(apiParams);
            
            const options = {
                hostname: 'fanyi-api.baidu.com',
                path: '/api/trans/vip/translate',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            
            const baiduReq = https.request(options, (baiduRes) => {
                let responseData = '';
                
                baiduRes.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                baiduRes.on('end', () => {
                    try {
                        // 解析百度API响应
                        const parsedData = JSON.parse(responseData);
                        
                        // 返回响应
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(parsedData));
                    } catch (error) {
                        console.error('解析百度API响应失败:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            error: '解析百度API响应失败',
                            details: error.message 
                        }));
                    }
                });
            });
            
            baiduReq.on('error', (error) => {
                console.error('请求百度API失败:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: '请求百度API失败',
                    details: error.message 
                }));
            });
            
            baiduReq.write(postData);
            baiduReq.end();
            
        } catch (error) {
            console.error('处理请求失败:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                error: '处理请求失败',
                details: error.message 
            }));
        }
    });
});

/**
 * 启动服务器
 */
server.listen(PORT, () => {
    console.log(`百度翻译API代理服务器已启动，监听端口: ${PORT}`);
    console.log(`代理地址: http://localhost:${PORT}`);
    console.log('请确保前端请求发送到: http://localhost:' + PORT + '/translate');
});

/**
 * 错误处理
 */
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`端口 ${PORT} 已被占用，请使用其他端口或关闭占用该端口的程序`);
    } else {
        console.error('服务器启动失败:', error);
    }
});