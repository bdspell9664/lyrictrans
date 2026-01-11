@echo off
chcp 65001 >nul
echo ========================================
echo 歌词翻译工具启动脚本
echo ========================================
echo.
echo 正在启动服务器...
echo.
echo 启动代理服务器 (端口: 3001)...
start /B node proxy.js
timeout /t 2 /nobreak >nul
echo 启动HTTP服务器 (端口: 8000)...
start /B npx http-server -p 8000 -c-1
echo.
echo ========================================
echo 服务器已启动!
echo HTTP服务器: http://localhost:8000
echo 代理服务器: http://localhost:3001
echo ========================================
echo 按 Ctrl+C 关闭服务器
echo.
pause