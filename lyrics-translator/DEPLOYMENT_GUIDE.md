# 歌词翻译工具部署指南

## 1. 功能概述

本歌词翻译工具提供了三个核心功能：

### 1.1 网页端代理加速器
- 可部署至GitHub Pages，独立于本地TRAE CN应用运行
- 使用多种代理方式：Cloudflare Workers或GitHub Pages Service Worker
- 在关闭TRAE CN应用后仍能正常使用代理服务

### 1.2 GitHub Pages代理服务
- 基于Service Worker的代理服务，可直接部署到GitHub Pages
- 无需额外的服务器资源，完全免费
- 解决跨域问题，支持浏览器直接调用百度翻译API

### 1.3 百度翻译API密钥持久化
- 自动保存百度翻译API密钥，消除每次使用时手动输入
- 提供安全的密钥存储机制
- 支持便捷的密钥管理界面

## 2. 部署前准备

### 2.1 百度翻译API密钥
已内置以下API密钥，也可自行注册百度翻译API获取：
- APP ID：`20251221002524051`
- 密钥：`tuvZN9D5mU7MtYcCPreF`

### 2.2 Cloudflare账户
- 注册Cloudflare账户：[https://www.cloudflare.com/](https://www.cloudflare.com/)
- 熟悉基本的Cloudflare Workers操作

## 3. Cloudflare Workers代理部署

### 3.1 创建Cloudflare Workers
1. 登录Cloudflare控制台，导航到「Workers & Pages」
2. 点击「创建应用」，选择「Workers」
3. 点击「创建Worker」，为Worker命名（如：`lyrics-translator-proxy`）
4. 点击「部署」创建Worker

### 3.2 配置Worker脚本
1. 点击已创建的Worker，进入「编辑代码」页面
2. 复制项目根目录下的`cloudflare-worker-proxy.js`文件内容
3. 替换Worker编辑器中的默认代码
4. 点击「保存并部署」

### 3.3 测试Worker
1. 部署完成后，访问Worker的URL（如：`https://lyrics-translator-proxy.example.workers.dev`）
2. 页面显示`Lyrics Translator Proxy Server is running.`表示部署成功
3. 可使用curl测试代理功能：
   ```bash
   curl -X POST "https://lyrics-translator-proxy.example.workers.dev/translate" \
   -H "Content-Type: application/x-www-form-urlencoded" \
   -d "q=test&from=en&to=zh&appid=20251221002524051&salt=123456&sign=xxx"
   ```

### 3.4 更新前端配置
1. 打开`js/services/aiService.js`文件
2. 将`cloudflareProxyUrl`变量更新为您的Worker URL：
   ```javascript
   const cloudflareProxyUrl = 'https://your-worker-name.example.workers.dev/translate';
   ```
3. 保存文件并部署到GitHub Pages

## 4. GitHub Pages代理服务部署

### 4.1 准备GitHub仓库
1. 创建一个新的GitHub仓库（如：`lyrics-translator-proxy`）
2. 克隆仓库到本地

### 4.2 部署代理服务
1. 将项目中`github-proxy`目录下的所有文件复制到新建的仓库中
2. 推送文件到GitHub仓库
3. 进入仓库「Settings」页面，导航到「Pages」配置
4. 选择「Source」为「Deploy from a branch」
5. 选择「Branch」为「main」或「master」，点击「Save」
6. 等待部署完成，访问仓库GitHub Pages URL（如：`https://your-username.github.io/lyrics-translator-proxy/`）

### 4.3 测试代理服务
1. 访问代理服务的URL，页面显示「GitHub Pages Proxy Server」表示部署成功
2. 可使用curl测试代理功能：
   ```bash
   curl -X POST "https://your-username.github.io/lyrics-translator-proxy/translate" \
   -H "Content-Type: application/x-www-form-urlencoded" \
   -d "q=test&from=en&to=zh&appid=20251221002524051&salt=123456&sign=xxx"
   ```

### 4.4 更新前端配置
1. 打开`js/services/aiService.js`文件
2. 将`githubProxyUrl`变量更新为您的代理服务URL：
   ```javascript
   const githubProxyUrl = 'https://your-username.github.io/lyrics-translator-proxy/translate';
   ```
3. 保存文件并部署到GitHub Pages

## 5. GitHub Pages部署

### 5.1 准备GitHub仓库
1. 创建GitHub仓库（如：`lyrics-translator`）
2. 将项目文件推送到仓库

### 5.2 配置GitHub Pages
1. 进入仓库「Settings」页面
2. 导航到「Pages」配置
3. 选择「Source」为「Deploy from a branch」
4. 选择「Branch」为「main」或「master」，点击「Save」
5. 等待部署完成，访问仓库GitHub Pages URL（如：`https://your-username.github.io/lyrics-translator/`）

## 5. 功能使用说明

### 5.1 API密钥管理

#### 5.1.1 保存API密钥
1. 打开应用页面
2. 在「翻译设置」部分找到「百度翻译API密钥设置」
3. 输入您的APP ID和密钥
4. 点击「保存密钥」按钮
5. 成功后会显示通知：「API密钥保存成功」

#### 5.1.2 清除API密钥
1. 在「百度翻译API密钥设置」部分
2. 点击「清除密钥」按钮
3. 成功后会显示通知：「API密钥已清除」

#### 5.1.3 自动加载
- 页面加载时会自动从本地存储加载已保存的API密钥
- 无需每次使用时手动输入

### 5.2 翻译功能使用
1. 拖放或浏览选择歌词文件
2. 选择源语言和目标语言
3. 点击「开始翻译」按钮
4. 查看翻译结果
5. 选择输出格式并下载翻译文件

## 6. 技术实现细节

### 6.1 API密钥安全存储
- 使用简单的XOR加密算法保护密钥
- 密钥存储在浏览器的localStorage中
- 仅在客户端使用，不会发送到服务器

### 6.2 代理服务架构
- **主代理**：Cloudflare Workers代理（部署在云端，始终可用）
- **备用代理**：本地代理服务器（用于开发环境或当Cloudflare代理不可用时）
- **直接请求**：当所有代理不可用时，直接调用百度翻译API

### 6.3 代理请求流程
1. 优先尝试Cloudflare Workers代理
2. 如果失败，尝试本地代理服务器
3. 如果仍失败，尝试直接调用百度翻译API
4. 移动设备默认直接调用百度翻译API

## 7. 本地开发

### 7.1 启动本地HTTP服务器
```bash
npm run start:http
```
访问：http://127.0.0.1:8000

### 7.2 启动本地代理服务器
```bash
npm run start:proxy
```
本地代理地址：http://localhost:3001/translate

## 8. 注意事项

### 8.1 GitHub Pages限制
- GitHub Pages仅支持静态文件，无法运行服务器端代码
- 因此必须使用Cloudflare Workers等外部代理服务

### 8.2 Cloudflare Workers配额
- Cloudflare Workers有免费配额限制（每天100,000次请求）
- 超过配额后需要付费或优化请求频率

### 8.3 密钥安全
- 请勿将包含API密钥的代码公开分享
- 建议使用个人的API密钥以避免配额限制

## 9. 故障排除

### 9.1 代理连接失败
- 检查Cloudflare Workers是否正确部署
- 确认Worker URL是否在`aiService.js`中正确配置
- 检查网络连接是否正常

### 9.2 API密钥无效
- 确认API密钥是否正确
- 检查百度翻译API服务是否正常
- 查看浏览器控制台是否有相关错误信息

### 9.3 翻译请求超时
- 检查网络连接是否稳定
- 尝试刷新页面后重试
- 确认Cloudflare Workers代理是否正常运行

## 10. 更新日志

### v1.0.0
- 实现Cloudflare Workers代理部署
- 实现百度翻译API密钥持久化保存
- 支持GitHub Pages独立部署
- 提供完整的部署指南

## 11. 许可证

本项目采用MIT许可证，可自由使用和修改。
