#!/usr/bin/env node

/**
 * 启动脚本 - 同时启动HTTP服务器和代理服务器
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 环境配置
const ENV = process.env.NODE_ENV || 'development';
const CONFIG = {
  // HTTP服务器配置
  http: {
    port: process.env.HTTP_PORT || 8000,
    root: process.cwd(),
    cache: process.env.HTTP_CACHE || '-c-1' // 默认禁用缓存
  },
  // 代理服务器配置
  proxy: {
    port: process.env.PROXY_PORT || 3001,
    wsPort: process.env.WS_PORT || 3002,
    apiPort: process.env.API_PORT || 3003
  },
  // 启动配置
  startup: {
    delay: process.env.STARTUP_DELAY || 2000, // 启动延迟
    retryCount: process.env.RETRY_COUNT || 2, // 重试次数
    retryDelay: process.env.RETRY_DELAY || 1000 // 重试延迟
  }
};

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

// 检查端口是否被占用
async function checkPortInUse(port, host = 'localhost') {
  const net = require('net');
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen({ port, host });
  });
}

// 查找可用端口
async function findAvailablePort(startPort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const isInUse = await checkPortInUse(port);
    if (!isInUse) {
      return port;
    }
  }
  return null;
}

// 检查命令是否可用
function checkCommandAvailable(cmd) {
  const { execSync } = require('child_process');
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// 安装缺失的依赖
async function installDependency(pkg) {
  colorLog(`正在安装依赖: ${pkg}...`, 'yellow');
  return new Promise((resolve, reject) => {
    const npmInstall = spawn('npm', ['install', '-g', pkg], {
      stdio: 'inherit',
      shell: true
    });

    npmInstall.on('close', (code) => {
      if (code === 0) {
        colorLog(`${pkg} 安装成功`, 'green');
        resolve(true);
      } else {
        colorLog(`${pkg} 安装失败`, 'red');
        resolve(false);
      }
    });
  });
}

// 启动HTTP服务器
async function startHttpServer(attempt = 0) {
  colorLog(`正在检查HTTP服务器端口 ${CONFIG.http.port}...`, 'cyan');
  
  // 检查端口是否被占用
  let isPortInUse = await checkPortInUse(CONFIG.http.port);
  let finalPort = CONFIG.http.port;
  
  if (isPortInUse) {
    // 尝试查找可用端口
    colorLog(`[HTTP服务器] 端口 ${CONFIG.http.port} 已被占用，正在查找可用端口...`, 'yellow');
    finalPort = await findAvailablePort(CONFIG.http.port);
    
    if (finalPort) {
      colorLog(`[HTTP服务器] 找到可用端口: ${finalPort}`, 'green');
      CONFIG.http.port = finalPort;
    } else {
      colorLog(`[HTTP服务器错误] 无法找到可用端口，尝试次数已达上限`, 'red');
      
      // 重试逻辑
      if (attempt < CONFIG.startup.retryCount) {
        colorLog(`[HTTP服务器] 正在重试启动... (${attempt + 1}/${CONFIG.startup.retryCount})`, 'yellow');
        await new Promise(resolve => setTimeout(resolve, CONFIG.startup.retryDelay));
        return startHttpServer(attempt + 1);
      }
      
      return null;
    }
  }

  // 检查http-server是否可用
  if (!checkCommandAvailable('http-server')) {
    colorLog('[HTTP服务器] http-server 未安装，正在尝试安装...', 'yellow');
    const installSuccess = await installDependency('http-server');
    if (!installSuccess) {
      colorLog('[HTTP服务器错误] http-server 安装失败', 'red');
      return null;
    }
  }

  colorLog(`[HTTP服务器] 正在启动HTTP服务器 (端口: ${finalPort})...`, 'cyan');
  
  // 准备启动命令
  const httpServer = spawn('npx', [
    'http-server',
    '-p', finalPort,
    CONFIG.http.cache,
    '-o', // 自动打开浏览器
    CONFIG.http.root
  ], {
    stdio: 'pipe',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: ENV
    }
  });

  httpServer.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      colorLog(`[HTTP服务器] ${output}`, 'cyan');
    }
  });

  httpServer.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      colorLog(`[HTTP服务器错误] ${output}`, 'red');
    }
  });

  httpServer.on('close', (code) => {
    if (code !== 0) {
      colorLog(`[HTTP服务器] 进程退出，代码: ${code}`, 'red');
    } else {
      colorLog('[HTTP服务器] 进程正常退出', 'green');
    }
  });

  httpServer.on('error', (error) => {
    colorLog(`[HTTP服务器错误] 进程启动失败: ${error.message}`, 'red');
  });

  return httpServer;
}

// 启动代理管理器（包含代理服务器、WebSocket服务和HTTP API）
async function startProxyManager(attempt = 0) {
  // 检查代理脚本是否存在
  const proxyManagerScript = path.join(__dirname, 'proxy-manager.js');
  if (!fs.existsSync(proxyManagerScript)) {
    colorLog(`[代理管理器错误] 代理管理器脚本不存在: ${proxyManagerScript}`, 'red');
    return null;
  }
  
  // 检查所有代理端口是否被占用
  const portsToCheck = [CONFIG.proxy.port, CONFIG.proxy.wsPort, CONFIG.proxy.apiPort];
  const portCheckResults = await Promise.all(portsToCheck.map(port => checkPortInUse(port)));
  
  const inUsePorts = portsToCheck.filter((port, index) => portCheckResults[index]);
  if (inUsePorts.length > 0) {
    colorLog(`[代理管理器] 以下端口已被占用: ${inUsePorts.join(', ')}`, 'yellow');
    colorLog(`[代理管理器] 尝试使用配置的端口继续启动...`, 'yellow');
    // 这里不直接返回错误，因为proxy-manager.js内部有端口冲突处理逻辑
  }

  colorLog(`[代理管理器] 正在启动代理管理器...`, 'yellow');
  colorLog(`[代理管理器] 配置: 代理端口=${CONFIG.proxy.port}, WebSocket端口=${CONFIG.proxy.wsPort}, API端口=${CONFIG.proxy.apiPort}`, 'yellow');
  
  // 准备环境变量
  const envVars = {
    ...process.env,
    NODE_ENV: ENV,
    PROXY_PORT: CONFIG.proxy.port,
    WS_PORT: CONFIG.proxy.wsPort,
    API_PORT: CONFIG.proxy.apiPort
  };

  const proxyManager = spawn('node', ['proxy-manager.js'], {
    stdio: 'pipe',
    shell: true,
    cwd: __dirname,
    env: envVars
  });

  proxyManager.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      colorLog(`[代理管理器] ${output}`, 'yellow');
    }
  });

  proxyManager.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      colorLog(`[代理管理器错误] ${output}`, 'red');
    }
  });

  proxyManager.on('close', (code) => {
    if (code !== 0) {
      colorLog(`[代理管理器] 进程退出，代码: ${code}`, 'red');
      
      // 重试逻辑
      if (attempt < CONFIG.startup.retryCount) {
        colorLog(`[代理管理器] 正在重试启动... (${attempt + 1}/${CONFIG.startup.retryCount})`, 'yellow');
        setTimeout(async () => {
          startProxyManager(attempt + 1);
        }, CONFIG.startup.retryDelay);
      }
    } else {
      colorLog('[代理管理器] 进程正常退出', 'green');
    }
  });

  proxyManager.on('error', (error) => {
    colorLog(`[代理管理器错误] 进程启动失败: ${error.message}`, 'red');
  });

  return proxyManager;
}

// 主函数
async function main() {
  colorLog('='.repeat(80), 'blue');
  colorLog('歌词翻译工具启动脚本', 'bright');
  colorLog(`环境: ${ENV.toUpperCase()}`, 'bright');
  colorLog('='.repeat(80), 'blue');
  
  colorLog('正在检查系统环境...', 'yellow');
  
  // 检查Node.js版本
  const nodeVersion = process.version;
  colorLog(`Node.js版本: ${nodeVersion}`, 'cyan');
  
  // 检查npm版本
  const { execSync } = require('child_process');
  let npmVersion = '未知';
  try {
    npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  } catch (error) {
    colorLog('无法获取npm版本', 'yellow');
  }
  colorLog(`npm版本: ${npmVersion}`, 'cyan');
  
  // 检查操作系统
  const os = require('os');
  colorLog(`操作系统: ${os.platform()} ${os.arch()}`, 'cyan');
  colorLog(`CPU核心数: ${os.cpus().length}`, 'cyan');
  
  colorLog('='.repeat(80), 'blue');
  colorLog('正在启动服务器...', 'yellow');
  
  // 启动代理管理器
  colorLog('启动代理管理器...', 'yellow');
  const proxyManager = await startProxyManager();
  
  if (!proxyManager) {
    colorLog('代理管理器启动失败', 'red');
    colorLog('尝试单独启动HTTP服务器...', 'yellow');
    
    // 即使代理管理器启动失败，也尝试启动HTTP服务器
    const httpServer = await startHttpServer();
    
    if (!httpServer) {
      colorLog('所有服务器启动失败，请解决问题后重试', 'red');
      process.exit(1);
    } else {
      colorLog('HTTP服务器已启动，但代理服务器不可用', 'yellow');
      colorLog('翻译功能可能无法正常工作', 'yellow');
    }
  } else {
    // 等待配置的延迟时间后启动HTTP服务器，确保代理管理器完全启动
    colorLog(`等待 ${CONFIG.startup.delay}ms 后启动HTTP服务器...`, 'yellow');
    
    setTimeout(async () => {
      colorLog('启动HTTP服务器...', 'yellow');
      const httpServer = await startHttpServer();
      
      if (!httpServer) {
        colorLog('HTTP服务器启动失败，但代理管理器已成功启动', 'yellow');
        colorLog('您可以使用其他HTTP服务器或直接打开index.html文件', 'yellow');
      }
      
      // 注册退出处理函数
      registerShutdownHandlers(proxyManager, httpServer);
      
      // 显示启动完成信息
      showStartupCompleteInfo(httpServer);
    }, CONFIG.startup.delay);
  }
}

// 注册退出处理函数
function registerShutdownHandlers(proxyManager, httpServer) {
  const shutdown = (signal) => {
    colorLog(`\n收到 ${signal} 信号，正在关闭服务器...`, 'yellow');
    
    // 标记正在关闭
    let shuttingDown = false;
    
    // 设置超时强制退出
    const timeout = setTimeout(() => {
      if (!shuttingDown) {
        colorLog('关闭超时，正在强制退出...', 'red');
        process.exit(1);
      }
    }, 5000);
    
    // 关闭代理管理器
    if (proxyManager && proxyManager.connected) {
      try {
        proxyManager.kill('SIGINT');
      } catch (error) {
        colorLog(`关闭代理管理器时出错: ${error.message}`, 'red');
      }
    }
    
    // 关闭HTTP服务器
    if (httpServer && httpServer.connected) {
      try {
        httpServer.kill('SIGINT');
      } catch (error) {
        colorLog(`关闭HTTP服务器时出错: ${error.message}`, 'red');
      }
    }
    
    // 监听进程退出
    const checkExit = () => {
      shuttingDown = true;
      clearTimeout(timeout);
      colorLog('服务器已关闭', 'green');
      process.exit(0);
    };
    
    // 等待进程退出
    let exitCount = 0;
    const totalProcesses = (proxyManager && proxyManager.connected ? 1 : 0) + 
                         (httpServer && httpServer.connected ? 1 : 0);
    
    if (proxyManager && proxyManager.connected) {
      proxyManager.on('close', () => {
        exitCount++;
        if (exitCount >= totalProcesses) checkExit();
      });
    }
    
    if (httpServer && httpServer.connected) {
      httpServer.on('close', () => {
        exitCount++;
        if (exitCount >= totalProcesses) checkExit();
      });
    }
    
    // 如果没有进程需要等待，直接退出
    if (totalProcesses === 0) {
      checkExit();
    }
  };
  
  // 监听各种退出信号
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGQUIT', () => shutdown('SIGQUIT'));
  
  // 处理未捕获的异常
  process.on('uncaughtException', (error) => {
    colorLog(`\n未捕获的异常: ${error.message}`, 'red');
    colorLog(error.stack, 'red');
    shutdown('uncaughtException');
  });
  
  // 处理未处理的Promise拒绝
  process.on('unhandledRejection', (reason, promise) => {
    colorLog(`\n未处理的Promise拒绝: ${reason}`, 'red');
    shutdown('unhandledRejection');
  });
}

// 显示启动完成信息
function showStartupCompleteInfo(httpServer) {
  colorLog('='.repeat(80), 'blue');
  colorLog('服务器启动完成!', 'green');
  colorLog('='.repeat(80), 'blue');
  
  if (httpServer) {
    colorLog(`HTTP服务器: http://localhost:${CONFIG.http.port}`, 'cyan');
    colorLog('您可以在浏览器中访问此地址使用歌词翻译工具', 'green');
  } else {
    colorLog('HTTP服务器启动失败', 'red');
    colorLog('您可以直接打开 index.html 文件使用基本功能', 'yellow');
  }
  
  // 显示代理服务器信息
  colorLog(`代理服务器: http://localhost:${CONFIG.proxy.port}`, 'yellow');
  colorLog(`WebSocket服务: ws://localhost:${CONFIG.proxy.wsPort}`, 'yellow');
  colorLog(`代理API服务: http://localhost:${CONFIG.proxy.apiPort}`, 'yellow');
  colorLog('翻译功能需要这些服务，请确保它们始终运行', 'yellow');
  
  colorLog('='.repeat(80), 'blue');
  colorLog('使用指南:', 'bright');
  
  if (httpServer) {
    colorLog(`1. 打开浏览器访问: http://localhost:${CONFIG.http.port}`, 'cyan');
  } else {
    colorLog('1. 直接在浏览器中打开 index.html 文件', 'cyan');
  }
  
  colorLog('2. 上传歌词文件进行翻译', 'cyan');
  colorLog('3. 查看控制台获取详细日志和状态信息', 'cyan');
  colorLog('4. 按 Ctrl+C 关闭服务器', 'red');
  
  colorLog('='.repeat(80), 'blue');
  colorLog('使用提示:', 'bright');
  colorLog('- 您可以通过环境变量自定义端口和配置', 'yellow');
  colorLog('- 示例: HTTP_PORT=8080 PROXY_PORT=3005 npm start', 'yellow');
  colorLog('- 在生产环境中，建议使用专门的HTTP服务器（如Nginx）', 'yellow');
  colorLog('='.repeat(80), 'blue');
}

// 运行主函数
main();