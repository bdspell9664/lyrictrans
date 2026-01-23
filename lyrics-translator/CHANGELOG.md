# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-01-23

### Added
- 支持逐字歌词的标准LRC扩展格式，兼容大多数播放器
- 增加了版本号显示，方便用户确认当前版本
- 完善了GitHub Pages代理服务器功能，支持部署到GitHub Pages
- 增强了代理服务器的健康检查和自动重启机制

### Fixed
- 修复了代理服务器无法处理HEAD请求的问题
- 修复了代理服务器的CORS头配置
- 优化了前端代理状态检查逻辑，增加了错误处理
- 修复了逐字歌词生成器的格式问题

### Changed
- 优化了LRC解析器，支持生成更通用的逐字歌词格式
- 改进了代理管理器的自动重启机制，采用指数退避策略
- 增强了代理服务器的日志记录，便于调试
- 优化了逐字歌词的生成逻辑，提高了兼容性

### Known Issues
- 部分移动浏览器可能存在跨域限制
- 逐字歌词生成准确性有待提高
- 批量翻译功能需要进一步测试

## [1.0.0] - 2026-01-12

### Added
- 歌词翻译核心功能，支持多种格式（LRC, TXT, SRT, ASS）
- 百度翻译API集成
- 本地代理服务器支持
- 音频上传功能，用于生成逐字歌词
- 逐字歌词生成功能（基于Web Audio API）
- 控制台日志功能
- 响应式设计，支持移动设备

### Fixed
- 修复了下载功能bug，将`createDownloadLink()`重命名为`downloadFile()`
- 修复了翻译结果重复问题，确保每个句子正确对应翻译
- 增强了移动设备兼容性，优化了跨域处理
- 改进了错误提示，提供更友好的用户体验

### Changed
- 优化了翻译请求流程，移动设备优先使用直接API调用
- 增加了下载进度显示和成功通知
- 改进了控制台UI设计

### Known Issues
- 部分移动浏览器可能存在跨域限制
- 逐字歌词生成准确性有待提高
- 批量翻译功能需要进一步测试
