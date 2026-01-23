const http = require('http');
const fs = require('fs');
const path = require('path');

// 设置服务器根目录
const root = process.cwd();
const port = 8001;

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    
    // 设置默认文件为index.html
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(root, filePath);
    
    // 获取文件扩展名
    const extname = path.extname(filePath);
    
    // 设置默认Content-Type
    let contentType = 'text/html';
    
    // 根据文件扩展名设置Content-Type
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
        case '.mp3':
            contentType = 'audio/mpeg';
            break;
    }
    
    // 读取文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 文件不存在
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                // 服务器错误
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            // 文件存在，返回文件内容
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// 绑定服务器到IPv4地址
server.listen(port, '0.0.0.0', () => {
    console.log(`\n测试服务器已启动!`);
    console.log(`==============================`);
    console.log(`HTTP服务器: http://localhost:${port}`);
    console.log(`==============================`);
    console.log(`使用指南:`);
    console.log(`1. 打开浏览器访问: http://localhost:${port}`);
    console.log(`2. 上传歌词文件进行翻译`);
    console.log(`3. 按 Ctrl+C 关闭服务器`);
    console.log(`==============================`);
});

// 处理服务器关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});
