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
                    // 修复毫秒计算，直接使用parseInt(match[3])，如果是三位数则除以1000，两位数则除以100
                    const millisecondStr = match[3];
                    let milliseconds;
                    if (millisecondStr.length === 3) {
                        // 三位数毫秒，如.456表示456毫秒
                        milliseconds = parseInt(millisecondStr);
                    } else if (millisecondStr.length === 2) {
                        // 两位数毫秒，如.45表示450毫秒
                        milliseconds = parseInt(millisecondStr) * 10;
                    } else {
                        // 一位数或其他情况，如.4表示400毫秒
                        milliseconds = parseInt(millisecondStr) * 100;
                    }
                    const totalMilliseconds = minutes * 60 * 1000 + seconds * 1000 + milliseconds;
                    
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

        // 首先添加所有元数据
        parsedData.lyricLines.forEach(line => {
            if (line.type === 'metadata') {
                lines.push(line.originalLine);
            }
        });
        
        // 添加空行分隔元数据和歌词
        if (lines.length > 0) {
            lines.push('');
        }

        // 处理歌词行
        parsedData.lyricLines.forEach(line => {
            if (line.type === 'lyric') {
                // 重建歌词行的时间戳
                const timeTags = line.timestamps.map(ts => {
                    // 格式化时间戳为标准格式：[mm:ss.xx]
                    const minutes = Math.floor(ts.totalMilliseconds / 60000);
                    const seconds = Math.floor((ts.totalMilliseconds % 60000) / 1000);
                    const centiseconds = Math.floor((ts.totalMilliseconds % 1000) / 10);
                    return `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}]`;
                }).join('');
                
                // 检查是否有逐字时间戳
                if (line.wordTimestamps && line.wordTimestamps.length > 0) {
                    // 生成逐字歌词，使用扩展LRC格式
                    // 基础行：[时间戳]完整歌词
                    // 逐字行：[时间戳]字1[时间戳]字2[时间戳]字3...
                    const fullLineText = line.translatedText || line.text;
                    lines.push(`${timeTags}${fullLineText}`);
                    
                    // 生成逐字歌词行
                    let wordLine = '';
                    line.wordTimestamps.forEach(wordTimestamp => {
                        // 格式化时间戳为标准格式：[mm:ss.xx]
                        const minutes = Math.floor(wordTimestamp.startTime / 60000);
                        const seconds = Math.floor((wordTimestamp.startTime % 60000) / 1000);
                        const centiseconds = Math.floor((wordTimestamp.startTime % 1000) / 10);
                        const wordTimeTag = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}]`;
                        
                        wordLine += `${wordTimeTag}${wordTimestamp.word}`;
                    });
                    lines.push(wordLine);
                    
                    // 如果是双语模式，添加翻译
                    if (includeOriginal && line.translatedText && line.text !== line.translatedText) {
                        // 翻译行：[时间戳]翻译文本
                        lines.push(`${timeTags}${line.text}`);
                    }
                } else {
                    // 普通歌词格式
                    // 如果是双语模式，每行原文后面跟着对应的翻译行
                    if (includeOriginal && line.translatedText && line.text !== line.translatedText) {
                        // 格式：
                        // [时间戳]翻译
                        // [时间戳]原文
                        lines.push(`${timeTags}${line.translatedText}`);
                        lines.push(`${timeTags}${line.text}`);
                    } else {
                        // 只显示翻译或原文
                        const text = line.translatedText || line.text;
                        lines.push(`${timeTags}${text}`);
                    }
                }
            } else if (line.type === 'text') {
                // 纯文本行
                if (includeOriginal && line.translatedText && line.text !== line.translatedText) {
                    // 格式：
                    // 翻译
                    // 原文
                    lines.push(line.translatedText);
                    lines.push(line.text);
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