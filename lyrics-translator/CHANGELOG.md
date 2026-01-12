# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
