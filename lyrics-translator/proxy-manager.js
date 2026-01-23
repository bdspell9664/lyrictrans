/**
 * 代理服务器管理器
 * 实现代理服务器的自动启动、状态监控和错误恢复
 */

const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 配置 - 支持环境变量
const PROXY_PORT = process.env.PROXY_PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;
const API_PORT = process.env.API_PORT || 3003;
const PROXY_SCRIPT = path.join(__dirname, process.env.PROXY_SCRIPT || 'proxy.js');
const HEALTH_CHECK_INTERVAL = process.env.HEALTH_CHECK_INTERVAL || 10000;
const MAX_RESTART_ATTEMPTS = process.env.MAX_RESTART_ATTEMPTS || 5;
const RESTART_DELAY = process.env.RESTART_DELAY || 3000;

// 状态管理
let proxyProcess = null;
let proxyStatus = 'stopped'; // stopped, starting, running, error, stopping
let wsServer = null;
let clients = new Set();
let restartAttempts = 0;
let lastRestartTime = 0;
let httpServer = null;

// 环境信息
const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';

// 日志函数
function log(level, message) {
    const timestamp = new Date().toISOString();
    const processInfo = proxyProcess ? `[PID: ${proxyProcess.pid}]` : '';
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${processInfo} ${message}`);
}

/**
 * 发送状态更新给所有WebSocket客户端
 */
function broadcastStatus() {
    const status = {
        status: proxyStatus,
        timestamp: new Date().toISOString(),
        pid: proxyProcess ? proxyProcess.pid : null,
        restartAttempts: restartAttempts,
        environment: env
    };
    
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(status));
        }
    }
    
    log('debug', `广播状态: ${proxyStatus}`);
}

/**
 * 更新代理状态
 */
function updateStatus(newStatus) {
    if (proxyStatus !== newStatus) {
        log('info', `状态变更: ${proxyStatus} -> ${newStatus}`);
        proxyStatus = newStatus;
        broadcastStatus();
    }
}

/**
 * 检查代理服务器是否已经在运行
 */
function checkProxyStatus() {
    return new Promise((resolve) => {
        // 尝试使用不同的请求方式和路径进行检查
        const checkPaths = ['/translate', '/status', '/ping'];
        let checkIndex = 0;
        
        const checkNextPath = () => {
            if (checkIndex >= checkPaths.length) {
                resolve(false);
                return;
            }
            
            const path = checkPaths[checkIndex];
            checkIndex++;
            
            const req = http.request({
                hostname: 'localhost',
                port: PROXY_PORT,
                path: path,
                method: 'HEAD',
                timeout: 2000
            }, (res) => {
                // 200, 405 (方法不允许), 404 (路径不存在但服务器运行) 都表示服务器正在运行
                if (res.statusCode >= 200 && res.statusCode < 500) {
                    log('debug', `代理服务器检查成功，路径: ${path}，状态码: ${res.statusCode}`);
                    resolve(true);
                } else {
                    checkNextPath();
                }
            });
            
            req.on('error', (error) => {
                log('debug', `代理服务器检查失败，路径: ${path}，错误: ${error.message}`);
                checkNextPath();
            });
            
            req.on('timeout', () => {
                log('debug', `代理服务器检查超时，路径: ${path}`);
                req.destroy();
                checkNextPath();
            });
            
            req.end();
        };
        
        checkNextPath();
    });
}

/**
 * 启动代理服务器
 */
function startProxy() {
    return new Promise(async (resolve, reject) => {
        // 先检查是否已经在运行
        const isRunning = await checkProxyStatus();
        if (isRunning) {
            log('info', '代理服务器已经在运行');
            updateStatus('running');
            restartAttempts = 0; // 重置重启尝试次数
            resolve(true);
            return;
        }
        
        // 检查代理脚本是否存在
        if (!fs.existsSync(PROXY_SCRIPT)) {
            const errorMsg = `代理脚本不存在: ${PROXY_SCRIPT}`;
            log('error', errorMsg);
            updateStatus('error');
            reject(new Error(errorMsg));
            return;
        }
        
        // 检查重启尝试次数
        const now = Date.now();
        if (restartAttempts >= MAX_RESTART_ATTEMPTS && (now - lastRestartTime) < 60000) {
            const errorMsg = `在过去60秒内已尝试重启${MAX_RESTART_ATTEMPTS}次，暂停重启`;
            log('error', errorMsg);
            updateStatus('error');
            reject(new Error(errorMsg));
            return;
        }
        
        updateStatus('starting');
        log('info', `正在启动代理服务器... (尝试 ${restartAttempts + 1}/${MAX_RESTART_ATTEMPTS})`);
        
        try {
            // 准备环境变量
            const envVars = {
                ...process.env,
                NODE_ENV: env,
                PROXY_PORT: PROXY_PORT,
                DEBUG: isDev ? 'proxy:*' : ''
            };
            
            // 启动代理进程
            proxyProcess = spawn('node', [PROXY_SCRIPT], {
                stdio: ['ignore', 'pipe', 'pipe'],
                cwd: __dirname,
                env: envVars,
                detached: false // 保持与父进程的关联，便于管理
            });
            
            log('debug', `代理服务器进程已启动，PID: ${proxyProcess.pid}`);
            
            // 监听输出
            proxyProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                // 根据输出内容调整日志级别
                if (output.includes('ERROR') || output.includes('error')) {
                    log('error', `代理输出: ${output}`);
                } else if (output.includes('WARN') || output.includes('warn')) {
                    log('warn', `代理输出: ${output}`);
                } else {
                    log('proxy', output);
                }
            });
            
            proxyProcess.stderr.on('data', (data) => {
                log('error', `代理错误输出: ${data.toString().trim()}`);
            });
            
            // 监听退出事件
            proxyProcess.on('exit', (code, signal) => {
                log('warn', `代理服务器进程退出，退出码: ${code}，信号: ${signal}`);
                proxyProcess = null;
                updateStatus('stopped');
                
                // 记录重启信息
                restartAttempts++;
                lastRestartTime = Date.now();
                
                // 自动重启，除非达到最大尝试次数
                if (restartAttempts < MAX_RESTART_ATTEMPTS) {
                    setTimeout(() => {
                        log('info', `尝试自动重启代理服务器... (尝试 ${restartAttempts + 1}/${MAX_RESTART_ATTEMPTS})`);
                        startProxy().catch(err => {
                            log('error', `自动重启失败: ${err.message}`);
                        });
                    }, RESTART_DELAY);
                } else {
                    log('error', `已达到最大重启尝试次数 (${MAX_RESTART_ATTEMPTS})，停止自动重启`);
                }
            });
            
            // 监听错误事件
            proxyProcess.on('error', (error) => {
                log('error', `代理进程错误: ${error.message}`);
            });
            
            // 检查代理是否成功启动
            let checkCount = 0;
            const maxChecks = isDev ? 20 : 10; // 开发环境延长检查时间
            const checkInterval = setInterval(async () => {
                checkCount++;
                const isRunning = await checkProxyStatus();
                
                if (isRunning) {
                    clearInterval(checkInterval);
                    log('info', '代理服务器启动成功');
                    updateStatus('running');
                    restartAttempts = 0; // 重置重启尝试次数
                    resolve(true);
                } else if (checkCount > maxChecks) {
                    clearInterval(checkInterval);
                    const errorMsg = `代理服务器启动超时，已尝试${maxChecks}次检查`;
                    log('error', errorMsg);
                    
                    // 清理进程
                    if (proxyProcess) {
                        try {
                            proxyProcess.kill('SIGINT');
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            if (proxyProcess) {
                                proxyProcess.kill('SIGKILL');
                            }
                        } catch (killError) {
                            log('error', `清理进程失败: ${killError.message}`);
                        }
                        proxyProcess = null;
                    }
                    
                    updateStatus('error');
                    reject(new Error(errorMsg));
                } else {
                    log('debug', `等待代理启动... (${checkCount}/${maxChecks})`);
                }
            }, 500);
            
        } catch (error) {
            log('error', `启动代理服务器失败: ${error.message}`);
            updateStatus('error');
            reject(error);
        }
    });
}

/**
 * 停止代理服务器
 */
function stopProxy() {
    return new Promise((resolve) => {
        if (proxyProcess) {
            log('info', `正在停止代理服务器... (PID: ${proxyProcess.pid})`);
            updateStatus('stopping');
            
            // 先尝试优雅关闭
            proxyProcess.kill('SIGINT');
            
            // 等待进程退出，超时后强制关闭
            const exitTimeout = setTimeout(() => {
                if (proxyProcess) {
                    log('warn', '代理服务器进程关闭超时，正在强制关闭...');
                    proxyProcess.kill('SIGKILL');
                }
            }, 5000);
            
            proxyProcess.on('exit', (code, signal) => {
                clearTimeout(exitTimeout);
                log('info', `代理服务器进程已退出，退出码: ${code}，信号: ${signal}`);
                proxyProcess = null;
                updateStatus('stopped');
                resolve(true);
            });
            
        } else {
            log('info', '代理服务器未运行');
            updateStatus('stopped');
            resolve(false);
        }
    });
}

/**
 * 重新启动代理服务器
 */
async function restartProxy() {
    log('info', '正在重启代理服务器...');
    await stopProxy();
    await startProxy();
}

/**
 * 创建WebSocket服务器
 */
function createWebSocketServer() {
    try {
        wsServer = new WebSocket.Server({ port: WS_PORT });
        
        wsServer.on('connection', (ws) => {
            log('info', '新的WebSocket客户端连接');
            clients.add(ws);
            
            // 发送初始状态
            ws.send(JSON.stringify({
                status: proxyStatus,
                timestamp: new Date().toISOString(),
                pid: proxyProcess ? proxyProcess.pid : null,
                restartAttempts: restartAttempts,
                environment: env
            }));
            
            // 处理客户端消息
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    log('debug', `收到WebSocket消息: ${JSON.stringify(data)}`);
                    
                    switch (data.action) {
                        case 'start':
                            startProxy().catch(err => {
                                log('error', `启动代理失败: ${err.message}`);
                            });
                            break;
                        case 'stop':
                            stopProxy().catch(err => {
                                log('error', `停止代理失败: ${err.message}`);
                            });
                            break;
                        case 'restart':
                            restartProxy().catch(err => {
                                log('error', `重启代理失败: ${err.message}`);
                            });
                            break;
                        case 'status':
                            ws.send(JSON.stringify({
                                status: proxyStatus,
                                timestamp: new Date().toISOString(),
                                pid: proxyProcess ? proxyProcess.pid : null,
                                restartAttempts: restartAttempts,
                                environment: env
                            }));
                            break;
                        default:
                            log('warn', `未知的WebSocket消息类型: ${data.action}`);
                    }
                } catch (error) {
                    log('error', `处理WebSocket消息失败: ${error.message}`);
                }
            });
            
            // 处理客户端断开连接
            ws.on('close', () => {
                log('info', 'WebSocket客户端断开连接');
                clients.delete(ws);
            });
            
            // 处理客户端错误
            ws.on('error', (error) => {
                log('error', `WebSocket客户端错误: ${error.message}`);
                clients.delete(ws);
            });
        });
        
        wsServer.on('error', (error) => {
            log('error', `WebSocket服务器错误: ${error.message}`);
            if (error.code === 'EADDRINUSE') {
                log('error', `WebSocket端口 ${WS_PORT} 已被占用`);
            }
        });
        
        wsServer.on('listening', () => {
            log('info', `WebSocket服务器已启动，监听端口: ${WS_PORT}`);
        });
        
    } catch (error) {
        log('error', `创建WebSocket服务器失败: ${error.message}`);
    }
}

/**
 * 创建HTTP API服务器，用于前端状态查询和控制
 */
function createHttpApiServer() {
    try {
        const server = http.createServer((req, res) => {
            // 设置CORS头
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.setHeader('Access-Control-Max-Age', '3600'); // 允许缓存CORS配置1小时
            
            if (req.method === 'OPTIONS') {
                res.writeHead(204); // 无内容响应
                res.end();
                return;
            }
            
            // 解析URL路径
            const url = req.url.split('?')[0];
            
            // 获取完整状态信息
            const getFullStatus = () => ({
                status: proxyStatus,
                timestamp: new Date().toISOString(),
                pid: proxyProcess ? proxyProcess.pid : null,
                restartAttempts: restartAttempts,
                maxRestartAttempts: MAX_RESTART_ATTEMPTS,
                environment: env,
                proxyPort: PROXY_PORT,
                wsPort: WS_PORT,
                apiPort: API_PORT,
                healthCheckInterval: HEALTH_CHECK_INTERVAL
            });
            
            if (url === '/api/proxy/status') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(getFullStatus()));
                return;
            }
            
            if (url === '/api/proxy/start' && req.method === 'POST') {
                startProxy()
                    .then(() => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, ...getFullStatus() }));
                    })
                    .catch((error) => {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: error.message, ...getFullStatus() }));
                    });
                return;
            }
            
            if (url === '/api/proxy/stop' && req.method === 'POST') {
                stopProxy()
                    .then(() => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, ...getFullStatus() }));
                    })
                    .catch((error) => {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: error.message, ...getFullStatus() }));
                    });
                return;
            }
            
            if (url === '/api/proxy/restart' && req.method === 'POST') {
                restartProxy()
                    .then(() => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, ...getFullStatus() }));
                    })
                    .catch((error) => {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: error.message, ...getFullStatus() }));
                    });
                return;
            }
            
            if (url === '/api/proxy/stats') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ...getFullStatus(),
                    websocketClients: clients.size,
                    startTime: lastRestartTime || Date.now()
                }));
                return;
            }
            
            // 根路径返回基本信息
            if (url === '/' || url === '/api') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    name: 'Proxy Manager API',
                    version: '1.0.0',
                    description: '代理服务器管理API',
                    endpoints: [
                        '/api/proxy/status',
                        '/api/proxy/start',
                        '/api/proxy/stop',
                        '/api/proxy/restart',
                        '/api/proxy/stats'
                    ]
                }));
                return;
            }
            
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found', path: url }));
        });
        
        // 监听服务器错误
        server.on('error', (error) => {
            log('error', `HTTP API服务器错误: ${error.message}`);
            if (error.code === 'EADDRINUSE') {
                log('error', `API端口 ${API_PORT} 已被占用，无法启动HTTP API服务器`);
            }
        });
        
        server.listen(API_PORT, () => {
            log('info', `HTTP API服务器已启动，监听端口: ${API_PORT}`);
        });
        
        httpServer = server;
        
    } catch (error) {
        log('error', `创建HTTP API服务器失败: ${error.message}`);
    }
}

/**
 * 定期检查代理状态
 */
function startHealthCheck() {
    setInterval(async () => {
        log('debug', '执行代理服务器健康检查...');
        
        // 无论当前状态如何，都进行检查
        const isRunning = await checkProxyStatus();
        
        if (proxyStatus === 'running' && !isRunning) {
            log('warn', '代理服务器健康检查失败，正在尝试重启...');
            updateStatus('error');
            await startProxy().catch(err => {
                log('error', `健康检查重启失败: ${err.message}`);
            });
        } else if (proxyStatus !== 'running' && isRunning) {
            // 如果代理实际在运行，但状态显示不正确，更新状态
            log('info', '代理服务器已恢复运行');
            updateStatus('running');
            restartAttempts = 0; // 重置重启尝试次数
        } else if (isRunning) {
            log('debug', '代理服务器健康检查通过');
        }
    }, HEALTH_CHECK_INTERVAL); // 使用配置的检查间隔
    
    log('info', `代理服务器健康检查已启动，间隔: ${HEALTH_CHECK_INTERVAL}ms`);
}

/**
 * 优雅关闭
 */
async function gracefulShutdown(signal) {
    log('info', `收到关闭信号 ${signal}，正在关闭代理管理器...`);
    
    // 更新状态
    updateStatus('stopping');
    
    // 关闭WebSocket服务器
    if (wsServer) {
        log('info', '正在关闭WebSocket服务器...');
        wsServer.close(err => {
            if (err) {
                log('error', `关闭WebSocket服务器失败: ${err.message}`);
            } else {
                log('info', 'WebSocket服务器已关闭');
            }
        });
    }
    
    // 关闭HTTP API服务器
    if (httpServer) {
        log('info', '正在关闭HTTP API服务器...');
        httpServer.close(err => {
            if (err) {
                log('error', `关闭HTTP API服务器失败: ${err.message}`);
            } else {
                log('info', 'HTTP API服务器已关闭');
            }
        });
    }
    
    // 停止代理进程
    if (proxyProcess) {
        log('info', `正在停止代理服务器进程 (PID: ${proxyProcess.pid})...`);
        
        // 先尝试优雅关闭
        proxyProcess.kill('SIGINT');
        
        // 等待进程退出，超时后强制关闭
        const exitTimeout = setTimeout(() => {
            log('warn', '代理服务器进程关闭超时，正在强制关闭...');
            if (proxyProcess) {
                proxyProcess.kill('SIGKILL');
            }
        }, 5000);
        
        proxyProcess.on('exit', (code, signal) => {
            clearTimeout(exitTimeout);
            log('info', `代理服务器进程已退出，退出码: ${code}，信号: ${signal}`);
        });
        
        proxyProcess = null;
    }
    
    // 关闭所有WebSocket客户端连接
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.close(1001, '服务器关闭');
        }
    }
    clients.clear();
    
    log('info', '代理管理器已关闭');
    process.exit(0);
}

/**
 * 初始化代理管理器
 */
async function init() {
    log('info', '正在初始化代理管理器...');
    log('info', `环境: ${env}, 配置: PROXY_PORT=${PROXY_PORT}, WS_PORT=${WS_PORT}, API_PORT=${API_PORT}`);
    
    try {
        // 启动WebSocket服务器
        createWebSocketServer();
        
        // 启动HTTP API服务器
        createHttpApiServer();
        
        // 启动健康检查
        startHealthCheck();
        
        // 尝试启动代理服务器
        await startProxy();
        log('info', '代理管理器初始化完成');
    } catch (error) {
        log('error', `代理管理器初始化失败: ${error.message}`);
        // 初始化失败不退出，继续运行以提供API服务
    }
}

// 监听各种关闭信号
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    log('error', `未捕获的异常: ${error.message}`);
    log('error', error.stack);
    // 异常后尝试重启代理
    if (proxyStatus === 'running') {
        startProxy().catch(err => {
            log('error', `异常后重启失败: ${err.message}`);
        });
    }
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
    log('error', `未处理的Promise拒绝: ${reason}`);
    // 拒绝后不重启，仅记录日志
});

// 启动代理管理器
init();
