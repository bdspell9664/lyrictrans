# Lyrics Translator Proxy

一个用于歌词翻译工具的GitHub Pages代理服务器，用于解决跨域问题。

## 功能特点

- 🚀 部署简单，只需GitHub Pages
- 🔒 安全可靠，直接转发请求到百度翻译API
- 🌍 支持所有来源的跨域请求
- 📱 兼容所有现代浏览器
- ⚡ 高性能，低延迟

## 部署说明

### 1. Fork仓库

Fork本仓库到您的GitHub账户。

### 2. 配置GitHub Pages

1. 进入Fork后的仓库设置
2. 找到「Pages」配置项
3. 选择「Source」为「Deploy from a branch」
4. 选择「Branch」为「main」或「master」，点击「Save」
5. 等待部署完成，获取GitHub Pages URL

### 3. 更新歌词翻译工具配置

在歌词翻译工具的代码中，将代理URL更新为您的GitHub Pages URL：

```javascript
// 在js/services/aiService.js中
const githubProxyUrl = 'https://your-username.github.io/lyrics-translator-proxy/translate';
```

## 使用方法

### 发送翻译请求

```javascript
fetch('https://your-username.github.io/lyrics-translator-proxy/translate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
        q: 'Hello World',
        from: 'en',
        to: 'zh',
        appid: 'your-app-id',
        salt: '123456',
        sign: 'your-sign'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

### 请求参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| q | string | 要翻译的文本 |
| from | string | 源语言（默认：auto） |
| to | string | 目标语言 |
| appid | string | 百度翻译APP ID |
| salt | string | 随机数 |
| sign | string | 签名 |

## 技术实现

### 核心文件

- `index.html` - 代理服务说明页面
- `proxy.js` - 代理服务核心逻辑
- `sw.js` - Service Worker，处理API请求

### 工作原理

1. 客户端发送请求到GitHub Pages代理
2. Service Worker拦截请求
3. 代理服务转发请求到百度翻译API
4. 百度翻译API返回响应
5. 代理服务返回响应给客户端

## 注意事项

1. **GitHub Pages限制**：GitHub Pages有请求频率限制，请勿滥用
2. **百度翻译API限制**：请遵守百度翻译API的使用条款
3. **安全性**：请勿在客户端代码中暴露您的百度翻译API密钥
4. **性能**：由于GitHub Pages的限制，代理请求可能会有延迟

## 故障排除

### 请求失败

1. 检查百度翻译API密钥是否正确
2. 检查请求参数是否完整
3. 查看浏览器控制台的错误信息
4. 检查GitHub Pages是否部署成功

### 跨域错误

1. 确保请求头中包含正确的Content-Type
2. 确保GitHub Pages已正确部署
3. 尝试刷新页面，重新注册Service Worker

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！
