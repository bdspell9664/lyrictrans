/**
 * LRC 歌词解析器
 * 解析 LRC 格式的歌词文件，提取时间戳和歌词内容
 */
class LRCParser {
    /**
     * 解析 LRC 格式的歌词文本
     * @param {string} text - LRC 格式的歌词文本
     * @returns {Object} - 解析结果，包含元数据和歌词行
     */
    parse(text) {
        const lines = text.split('\n');
        const result = {
            metadata: {},
            lyricLines: []
        };

        lines.forEach((line, index) => {
            line = line.trim();
            if (!line) return;

            // 解析元数据（如 [ti:标题] [ar:艺术家] 等）
            const metadataMatch = line.match(/^\[(\w+):(.+?)\]$/);
            if (metadataMatch) {
                const key = metadataMatch[1].toLowerCase();
                const value = metadataMatch[2].trim();
                result.metadata[key] = value;
                result.lyricLines.push({
                    index,
                    originalLine: line,
                    type: 'metadata',
                    key,
                    value
                });
                return;
            }

            // 解析歌词行（如 [01:23.45]歌词内容）
            const lyricMatch = line.match(/^((\[\d+:\d+\.\d+\])+)(.+)$/);
            if (lyricMatch) {
                const timeTags = lyricMatch[1];
                const text = lyricMatch[3].trim();
                
                // 提取所有时间戳
                const timestamps = [];
                const timeTagRegex = /\[(\d+):(\d+)\.(\d+)\]/g;
                let match;
                while ((match = timeTagRegex.exec(timeTags)) !== null) {
                    const minutes = parseInt(match[1]);
                    const seconds = parseInt(match[2]);
                    const milliseconds = parseInt(match[3]);
                    const totalMilliseconds = minutes * 60 * 1000 + seconds * 1000 + milliseconds * 10;
                    
                    timestamps.push({
                        original: match[0],
                        minutes,
                        seconds,
                        milliseconds,
                        totalMilliseconds
                    });
                }

                result.lyricLines.push({
                    index,
                    originalLine: line,
                    type: 'lyric',
                    timestamps,
                    text,
                    translatedText: ''
                });
                return;
            }

            // 处理没有时间戳的纯文本行
            result.lyricLines.push({
                index,
                originalLine: line,
                type: 'text',
                text: line,
                translatedText: ''
            });
        });

        return result;
    }

    /**
     * 根据解析结果生成 LRC 格式的歌词文本
     * @param {Object} parsedData - 解析结果对象
     * @param {boolean} includeOriginal - 是否包含原文（双语模式）
     * @returns {string} - 生成的 LRC 文本
     */
    generate(parsedData, includeOriginal = false) {
        const lines = [];

        parsedData.lyricLines.forEach(line => {
            if (line.type === 'metadata') {
                // 保持元数据不变
                lines.push(line.originalLine);
            } else if (line.type === 'lyric') {
                // 重建歌词行，包含所有时间戳
                const timeTags = line.timestamps.map(ts => ts.original).join('');
                let text = line.translatedText || line.text;
                
                // 如果是双语模式，添加原文
                if (includeOriginal && line.translatedText) {
                    text = `${text}\n${timeTags}${line.text}`;
                }
                
                lines.push(`${timeTags}${text}`);
            } else if (line.type === 'text') {
                // 纯文本行使用翻译后的文本
                lines.push(line.translatedText || line.text);
            }
        });

        return lines.join('\n');
    }

    /**
     * 检测文本是否为 LRC 格式
     * @param {string} text - 要检测的文本
     * @returns {boolean} - 是否为 LRC 格式
     */
    isLRCFormat(text) {
        // 检查是否包含 LRC 特征：时间戳格式 [mm:ss.xx]
        const lrcPattern = /\[\d+:\d+\.\d+\]/;
        return lrcPattern.test(text);
    }

    /**
     * 获取支持的文件扩展名
     * @returns {Array<string>} - 支持的文件扩展名数组
     */
    getSupportedExtensions() {
        return ['.lrc'];
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LRCParser;
}