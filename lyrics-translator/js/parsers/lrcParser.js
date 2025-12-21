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
                // 检查是否有逐字时间戳
                if (line.wordTimestamps && line.wordTimestamps.length > 0) {
                    // 生成逐字歌词
                    let wordLyric = '';
                    
                    // 添加第一个时间戳
                    const firstTimeTag = line.timestamps.map(ts => ts.original).join('');
                    
                    // 生成逐字歌词内容
                    line.wordTimestamps.forEach(wordTimestamp => {
                        // 格式化时间戳：[mm:ss.xxx]
                        const minutes = Math.floor(wordTimestamp.startTime / 60000);
                        const seconds = Math.floor((wordTimestamp.startTime % 60000) / 1000);
                        const milliseconds = wordTimestamp.startTime % 1000;
                        const timeTag = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}]`;
                        
                        // 添加时间戳和字
                        wordLyric += `${timeTag}${wordTimestamp.word}`;
                    });
                    
                    // 如果是双语模式，添加翻译
                    if (includeOriginal && line.translatedText) {
                        // 为翻译添加时间戳
                        const translatedText = line.translatedText;
                        const translatedWordLyric = firstTimeTag + translatedText;
                        lines.push(wordLyric);
                        lines.push(translatedWordLyric);
                    } else {
                        // 只添加逐字歌词
                        lines.push(wordLyric);
                    }
                } else {
                    // 普通歌词格式
                    // 重建歌词行，包含所有时间戳
                    const timeTags = line.timestamps.map(ts => ts.original).join('');
                    
                    // 如果是双语模式，在每句原文后附上翻译
                    if (includeOriginal && line.translatedText) {
                        // 格式：[时间戳]原文 [翻译]
                        lines.push(`${timeTags}${line.text} [${line.translatedText}]`);
                    } else {
                        // 只显示翻译或原文
                        const text = line.translatedText || line.text;
                        lines.push(`${timeTags}${text}`);
                    }
                }
            } else if (line.type === 'text') {
                // 纯文本行
                if (includeOriginal && line.translatedText) {
                    // 格式：原文 [翻译]
                    lines.push(`${line.text} [${line.translatedText}]`);
                } else {
                    const text = line.translatedText || line.text;
                    lines.push(text);
                }
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
} else {
    // 浏览器环境全局导出
    window.LRCParser = LRCParser;
}