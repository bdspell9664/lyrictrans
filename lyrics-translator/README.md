# 歌词翻译工具

一个功能强大的歌词翻译工具，支持多种歌词格式，借助AI轻松翻译。

## 功能特点

- 支持多种歌词格式：LRC、SRT、ASS、SSA、TXT
- 多种翻译语言支持
- 双语模式（原文+译文）
- 批量翻译功能
- 逐字歌词生成（实验性）
- 实时控制台日志
- 代理服务器状态检测

## GitHub Pages部署说明

### 部署限制

由于GitHub Pages的静态站点特性，部署到GitHub Pages后，**翻译功能需要本地代理服务器支持**。这是因为：

1. 百度翻译API有跨域限制，无法直接从浏览器调用
2. GitHub Pages不支持运行Node.js服务器
3. 翻译功能依赖本地代理服务器解决跨域问题

### 本地使用指南

要使用完整的翻译功能，请按照以下步骤操作：

1. **克隆项目到本地**
   ```bash
   git clone https://github.com/your-username/lyrics-translator.git
   cd lyrics-translator
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动服务器**
   ```bash
   npm start
   ```
   这将同时启动：
   - HTTP服务器（端口8000）
   - 百度翻译API代理服务器（端口3001）

4. **访问应用**
   打开浏览器访问：
   ```
   http://localhost:8000
   ```

### 直接使用GitHub Pages

如果你直接访问GitHub Pages上的应用（如 `https://your-username.github.io/lyrics-translator`）：

1. 你可以正常上传和查看歌词文件
2. 但翻译功能将不可用，除非你手动启动本地代理服务器
3. 控制台会显示清晰的提示信息，指导你如何启动代理服务器

## 快速开始

### 基本使用

1. 上传歌词文件（支持拖放）
2. 选择源语言和目标语言
3. 点击"开始翻译"按钮
4. 查看翻译结果
5. 下载翻译后的文件

### 批量翻译

1. 上传多个歌词文件
2. 点击"批量翻译"按钮
3. 等待所有文件翻译完成
4. 点击"批量下载"下载所有翻译文件

### 生成逐字歌词

1. 上传歌词文件
2. 上传对应的音频文件
3. 选择源语言
4. 点击"生成逐字歌词"按钮
5. 等待处理完成后查看结果

## 代理服务器

### 为什么需要代理服务器？

百度翻译API有严格的跨域限制，浏览器无法直接调用。代理服务器作为中间层，解决了跨域问题，同时提供了更好的错误处理和日志记录。

### 启动代理服务器

```bash
# 方式1：同时启动HTTP服务器和代理服务器
npm start

# 方式2：仅启动代理服务器
npm run start:proxy
```

### 代理服务器配置

- 代理地址：http://localhost:3001/translate
- 支持POST请求
- 自动处理CORS问题
- 支持请求日志记录

## 技术栈

- HTML5 + CSS3 + JavaScript
- Node.js（用于代理服务器）
- 百度翻译API
- 无外部依赖（纯前端实现）

## 项目结构

```
lyrics-translator/
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── services/
│   │   └── aiService.js   # AI翻译服务
│   ├── utils/
│   │   └── file.js        # 文件处理工具
│   ├── parsers/           # 各种格式解析器
│   │   ├── lrcParser.js
│   │   ├── srtParser.js
│   │   ├── assParser.js
│   │   ├── txtParser.js
│   │   └── parserManager.js
│   └── app.js             # 主应用逻辑
├── md5.js                 # MD5加密算法
├── proxy.js               # 代理服务器
├── start.js               # 启动脚本
├── package.json           # 项目配置
└── index.html             # 主页面
```

## 常见问题

### 1. 翻译失败，提示"Failed to fetch"？

**解决方案**：
- 确保本地代理服务器已启动
- 检查网络连接
- 查看控制台日志获取详细错误信息

### 2. 代理服务器无法启动？

**可能原因**：
- 端口3001已被占用
- Node.js未安装

**解决方案**：
- 关闭占用端口3001的程序
- 安装最新版本的Node.js

### 3. 翻译结果不准确？

**解决方案**：
- 检查源语言设置是否正确
- 尝试调整目标语言
- 确保歌词文本格式正确

## 开发说明

### 本地开发

```bash
# 启动开发服务器（端口8000）
npm run start:http

# 启动代理服务器（端口3001）
npm run start:proxy
```

### 项目配置

主要配置文件：
- `js/services/aiService.js`：AI服务配置
- `proxy.js`：代理服务器配置

## 许可证

ISC

## 贡献

欢迎提交Issue和Pull Request！

## 注意事项

- 本项目仅用于学习和研究目的
- 请遵守百度翻译API的使用条款
- 翻译结果可能存在偏差，请自行校对

---

**使用本工具即表示您同意上述条款和注意事项。**
