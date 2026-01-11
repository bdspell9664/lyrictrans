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

// 启动HTTP服务器
function startHttpServer() {
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
function startProxyServer() {
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
function main() {
  colorLog('='.repeat(60), 'blue');
  colorLog('歌词翻译工具启动脚本', 'bright');
  colorLog('='.repeat(60), 'blue');
  
  colorLog('正在启动服务器...', 'yellow');
  
  // 启动代理服务器
  colorLog('启动代理服务器 (端口: 3001)...', 'yellow');
  const proxyServer = startProxyServer();
  
  // 等待一秒后启动HTTP服务器
  setTimeout(() => {
    colorLog('启动HTTP服务器 (端口: 8000)...', 'yellow');
    const httpServer = startHttpServer();
    
    // 监听退出信号
    process.on('SIGINT', () => {
      colorLog('\n正在关闭服务器...', 'yellow');
      
      proxyServer.kill('SIGINT');
      httpServer.kill('SIGINT');
      
      setTimeout(() => {
        colorLog('服务器已关闭', 'green');
        process.exit(0);
      }, 1000);
    });
    
    process.on('SIGTERM', () => {
      colorLog('\n正在关闭服务器...', 'yellow');
      
      proxyServer.kill('SIGTERM');
      httpServer.kill('SIGTERM');
      
      setTimeout(() => {
        colorLog('服务器已关闭', 'green');
        process.exit(0);
      }, 1000);
    });
    
    colorLog('='.repeat(60), 'blue');
    colorLog('服务器已启动!', 'green');
    colorLog('HTTP服务器: http://localhost:8000', 'cyan');
    colorLog('代理服务器: http://localhost:3001', 'yellow');
    colorLog('='.repeat(60), 'blue');
    colorLog('按 Ctrl+C 关闭服务器', 'red');
  }, 1000);
}

// 运行主函数
main();