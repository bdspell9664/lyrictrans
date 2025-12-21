/**
 * TXT 文本解析器
 * 解析纯文本格式的歌词，按行处理
 */
class TXTParser {
    /**
     * 解析 TXT 格式的歌词文本
     * @param {string} text - TXT 格式的歌词文本
     * @returns {Object} - 解析结果，包含文本行
     */
    parse(text) {
        // 处理不同换行符
        const normalizedText = text.replace(/\r\n/g, '\n');
        const lines = normalizedText.split('\n');
        const result = {
            textLines: []
        };

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            result.textLines.push({
                index,
                originalLine: line,
                trimmedLine: trimmedLine,
                isEmpty: trimmedLine === '',
                type: trimmedLine === '' ? 'empty' : 'text',
                text: trimmedLine,
                translatedText: ''
            });
        });

        return result;
    }

    /**
     * 根据解析结果生成 TXT 格式的歌词文本
     * @param {Object} parsedData - 解析结果对象
     * @param {boolean} includeOriginal - 是否包含原文（双语模式）
     * @returns {string} - 生成的 TXT 文本
     */
    generate(parsedData, includeOriginal = false) {
        const lines = [];

        parsedData.textLines.forEach(line => {
            if (line.type === 'empty') {
                // 保留空行
                lines.push('');
            } else {
                let text = line.translatedText || line.text;
                
                // 如果是双语模式，添加原文
                if (includeOriginal && line.translatedText) {
                    text = `${text}\n${line.text}`;
                }
                
                lines.push(text);
            }
        });

        return lines.join('\n');
    }

    /**
     * 检测文本是否为 TXT 格式
     * 注意：TXT 是默认格式，当其他格式都不匹配时使用
     * @param {string} text - 要检测的文本
     * @returns {boolean} - 是否为 TXT 格式
     */
    isTXTFormat(text) {
        // TXT 格式是默认格式，所以总是返回 true
        // 实际使用中，会在其他格式检测失败后使用
        return true;
    }

    /**
     * 获取支持的文件扩展名
     * @returns {Array<string>} - 支持的文件扩展名数组
     */
    getSupportedExtensions() {
        return ['.txt'];
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TXTParser;
} else {
    // 浏览器环境全局导出
    window.TXTParser = TXTParser;
}