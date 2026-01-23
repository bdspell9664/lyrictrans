/**
 * 百度翻译API代理服务器 - 改进版
 * 解决前端跨域请求问题
 */

const http = require('http');
const https = require('https');
const url = require('url');
const crypto = require('crypto');

// 配置
const PORT = 3001;
const BAIDU_API_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 日志函数
function log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
}

// 错误处理函数
function handleError(res, message, statusCode = 500) {
    log('error', message);
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ 
        error: message,
        timestamp: new Date().toISOString()
    }));
}

// 成功响应函数
function handleSuccess(res, data) {
    log('info', `翻译成功，返回 ${data.trans_result ? data.trans_result.length : 0} 条结果`);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

/**
 * 创建代理服务器
 */
const server = http.createServer((req, res) => {
    // 记录请求信息
    log('info', `收到请求: ${req.method} ${req.url}`);
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        log('info', '处理预检请求');
        res.writeHead(204);
        res.end();
        return;
    }
    
    // 处理HEAD请求
    if (req.method === 'HEAD') {
        log('info', '处理HEAD请求');
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Server': 'LyricsTranslator/1.0',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With'
        });
        res.end();
        return;
    }
    
    // 处理GET请求（用于健康检查）
    if (req.method === 'GET') {
        log('info', '处理GET请求');
        // 只允许/translate路径的GET请求，用于健康检查
        if (req.url === '/translate' || req.url === '/status' || req.url === '/ping') {
            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ 
                status: 'ok', 
                message: 'Proxy server is running',
                timestamp: new Date().toISOString() 
            }));
            return;
        } else {
            return handleError(res, '请求路径不正确', 404);
        }
    }
    
    // 只处理POST请求
    if (req.method !== 'POST') {
        return handleError(res, '只支持POST请求', 405);
    }
    
    // 解析URL
    const parsedUrl = url.parse(req.url);
    
    // 只处理翻译请求
    if (parsedUrl.pathname !== '/translate') {
        return handleError(res, '请求路径不正确', 404);
    }
    
    // 收集请求体
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            log('info', `收到请求体，长度: ${body.length}`);
            
            // 解析请求参数
            const params = new URLSearchParams(body);
            
            // 验证必需参数
            const q = params.get('q');
            const from = params.get('from') || 'auto';
            const to = params.get('to') || 'zh';
            const appid = params.get('appid');
            const salt = params.get('salt');
            const sign = params.get('sign');
            
            // 总是生成签名，确保使用正确的MD5实现
            // 根据百度官方文档生成签名：appid + q + salt + 密钥
            const secretKey = 'tuvZN9D5mU7MtYcCPreF';
            const signString = `${appid}${q}${salt}${secretKey}`;
            const finalSign = crypto.createHash('md5').update(signString, 'utf8').digest('hex');
            log('info', `生成签名: ${signString} -> ${finalSign}`);
            
            if (!q || !appid || !salt) {
                return handleError(res, '缺少必需参数: q, appid, salt', 400);
            }
            
            log('info', `翻译请求: ${from} -> ${to}, 文本长度: ${q.length}`);
            
            // 构建百度API请求参数
            const postData = new URLSearchParams({
                q: q,
                from: from,
                to: to,
                appid: appid,
                salt: salt,
                sign: finalSign
            }).toString();
            
            const options = {
                hostname: 'fanyi-api.baidu.com',
                path: '/api/trans/vip/translate',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData),
                    'User-Agent': 'LyricsTranslator/1.0'
                }
            };
            
            log('info', `转发请求到百度API: ${options.hostname}${options.path}`);
            
            // 转发请求到百度API
            const baiduReq = https.request(options, (baiduRes) => {
                let responseData = '';
                
                baiduRes.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                baiduRes.on('end', () => {
                    try {
                        log('info', `收到百度API响应，长度: ${responseData.length}`);
                        
                        // 解析百度API响应
                        const parsedData = JSON.parse(responseData);
                        
                        // 返回响应
                        handleSuccess(res, parsedData);
                    } catch (error) {
                        log('error', `解析百度API响应失败: ${error.message}`);
                        handleError(res, `解析响应失败: ${error.message}`, 500);
                    }
                });
            });
            
            baiduReq.on('error', (error) => {
                log('error', `请求百度API失败: ${error.message}`);
                handleError(res, `请求百度API失败: ${error.message}`, 500);
            });
            
            // 设置超时
            baiduReq.setTimeout(10000, () => {
                log('error', '请求百度API超时');
                baiduReq.destroy();
                handleError(res, '请求百度API超时', 504);
            });
            
            baiduReq.write(postData);
            baiduReq.end();
            
        } catch (error) {
            log('error', `处理请求失败: ${error.message}`);
            handleError(res, `处理请求失败: ${error.message}`, 400);
        }
    });
});

/**
 * 启动服务器
 */
server.listen(PORT, () => {
    log('info', `百度翻译API代理服务器已启动，监听端口: ${PORT}`);
    log('info', `代理地址: http://localhost:${PORT}`);
    log('info', '请确保前端请求发送到: http://localhost:' + PORT + '/translate');
});

/**
 * 错误处理
 */
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        log('error', `端口 ${PORT} 已被占用，请使用其他端口或关闭占用该端口的程序`);
    } else {
        log('error', `服务器启动失败: ${error.message}`);
    }
});

// 优雅关闭
process.on('SIGINT', () => {
    log('info', '收到关闭信号，正在关闭服务器...');
    server.close(() => {
        log('info', '服务器已关闭');
        process.exit(0);
    });
});