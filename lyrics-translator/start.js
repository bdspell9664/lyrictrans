#!/usr/bin/env node

/**
 * 启动脚本 - 同时启动HTTP服务器和代理服务器
 */

const { spawn } = require('child_process');
const path = require('path');

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
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查端口是否被占用
function checkPortInUse(port) {
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
    server.listen(port);
  });
}

// 启动HTTP服务器
async function startHttpServer() {
  // 检查端口是否被占用
  const isPortInUse = await checkPortInUse(8000);
  if (isPortInUse) {
    colorLog('[HTTP服务器错误] 端口 8000 已被占用', 'red');
    colorLog('[提示] 尝试关闭占用该端口的程序，或使用其他端口', 'yellow');
    return null;
  }

  const httpServer = spawn('npx', ['http-server', '-p', '8000', '-c-1'], {
    stdio: 'pipe',
    shell: true
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

  return httpServer;
}

// 启动代理服务器
async function startProxyServer() {
  // 检查端口是否被占用
  const isPortInUse = await checkPortInUse(3001);
  if (isPortInUse) {
    colorLog('[代理服务器错误] 端口 3001 已被占用', 'red');
    colorLog('[提示] 尝试关闭占用该端口的程序，或使用其他端口', 'yellow');
    return null;
  }

  const proxyServer = spawn('node', ['proxy.js'], {
    stdio: 'pipe',
    shell: true
  });

  proxyServer.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      colorLog(`[代理服务器] ${output}`, 'yellow');
    }
  });

  proxyServer.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      colorLog(`[代理服务器错误] ${output}`, 'red');
    }
  });

  proxyServer.on('close', (code) => {
    if (code !== 0) {
      colorLog(`[代理服务器] 进程退出，代码: ${code}`, 'red');
    } else {
      colorLog('[代理服务器] 进程正常退出', 'green');
    }
  });

  return proxyServer;
}

// 主函数
async function main() {
  colorLog('='.repeat(60), 'blue');
  colorLog('歌词翻译工具启动脚本', 'bright');
  colorLog('='.repeat(60), 'blue');
  
  colorLog('正在检查系统环境...', 'yellow');
  
  // 检查Node.js版本
  const nodeVersion = process.version;
  colorLog(`Node.js版本: ${nodeVersion}`, 'cyan');
  
  colorLog('正在启动服务器...', 'yellow');
  
  // 启动代理服务器
  colorLog('启动代理服务器 (端口: 3001)...', 'yellow');
  const proxyServer = await startProxyServer();
  
  if (!proxyServer) {
    colorLog('启动失败，请解决端口占用问题后重试', 'red');
    process.exit(1);
  }
  
  // 等待一秒后启动HTTP服务器
  setTimeout(async () => {
    colorLog('启动HTTP服务器 (端口: 8000)...', 'yellow');
    const httpServer = await startHttpServer();
    
    if (!httpServer) {
      colorLog('HTTP服务器启动失败，但代理服务器已成功启动', 'yellow');
      colorLog('您可以使用其他HTTP服务器或直接打开index.html文件', 'yellow');
      colorLog('代理服务器仍可正常使用: http://localhost:3001', 'yellow');
    }
    
    // 监听退出信号
    process.on('SIGINT', () => {
      colorLog('\n正在关闭服务器...', 'yellow');
      
      proxyServer.kill('SIGINT');
      if (httpServer) {
        httpServer.kill('SIGINT');
      }
      
      setTimeout(() => {
        colorLog('服务器已关闭', 'green');
        process.exit(0);
      }, 1000);
    });
    
    process.on('SIGTERM', () => {
      colorLog('\n正在关闭服务器...', 'yellow');
      
      proxyServer.kill('SIGTERM');
      if (httpServer) {
        httpServer.kill('SIGTERM');
      }
      
      setTimeout(() => {
        colorLog('服务器已关闭', 'green');
        process.exit(0);
      }, 1000);
    });
    
    colorLog('='.repeat(60), 'blue');
    colorLog('服务器启动完成!', 'green');
    
    if (httpServer) {
      colorLog('HTTP服务器: http://localhost:8000', 'cyan');
      colorLog('您可以在浏览器中访问此地址使用歌词翻译工具', 'green');
    } else {
      colorLog('HTTP服务器启动失败', 'red');
      colorLog('您可以直接打开 index.html 文件使用基本功能', 'yellow');
    }
    
    colorLog('代理服务器: http://localhost:3001', 'yellow');
    colorLog('翻译功能需要此代理服务器，请确保它始终运行', 'yellow');
    
    colorLog('='.repeat(60), 'blue');
    colorLog('使用指南:', 'bright');
    colorLog('1. 打开浏览器访问: http://localhost:8000', 'cyan');
    colorLog('2. 上传歌词文件进行翻译', 'cyan');
    colorLog('3. 查看控制台获取详细日志和状态信息', 'cyan');
    colorLog('4. 按 Ctrl+C 关闭服务器', 'red');
    colorLog('='.repeat(60), 'blue');
  }, 1000);
}

// 运行主函数
main();