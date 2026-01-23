/**
 * DB (Douban Music) 格式生成器
 * 将LRC格式的歌词转换为DB格式
 */
class DBGenerator {
    /**
     * 生成DB格式的歌词文本
     * @param {Object} parsedData - 解析后的歌词数据
     * @param {boolean} includeOriginal - 是否包含原文（双语模式）
     * @returns {string} - 生成的DB文本
     */
    generate(parsedData, includeOriginal = false) {
        const lines = [];
        
        // DB格式开头
        lines.push('[ti:default]');
        lines.push('[ar:default]');
        lines.push('[al:default]');
        lines.push('[by:LyricsTranslator]');
        lines.push('[offset:0]');
        
        // 添加元数据
        if (parsedData.metadata) {
            for (const [key, value] of Object.entries(parsedData.metadata)) {
                lines.push(`[${key}:${value}]`);
            }
        }
        
        // 处理每一行歌词
        parsedData.lyricLines.forEach(line => {
            if (line.type === 'lyric') {
                line.timestamps.forEach(timestamp => {
                    const timeInSeconds = timestamp.totalMilliseconds / 1000;
                    const timeStr = this._formatTime(timeInSeconds);
                    
                    if (line.wordTimestamps && line.wordTimestamps.length > 0) {
                        // 逐字歌词格式
                        let wordLyric = `${timeStr}`;
                        
                        // 处理每个字的时间戳
                        line.wordTimestamps.forEach(wordTimestamp => {
                            const wordTimeInSeconds = wordTimestamp.startTime / 1000;
                            const relativeTime = Math.round((wordTimeInSeconds - timeInSeconds) * 1000);
                            wordLyric += `(${relativeTime})${wordTimestamp.word}`;
                        });
                        
                        lines.push(wordLyric);
                        
                        // 如果是双语模式，添加翻译
                        if (includeOriginal && line.translatedText) {
                            lines.push(`${timeStr}${line.translatedText}`);
                        }
                    } else {
                        // 普通歌词格式
                        const text = line.translatedText || line.text;
                        lines.push(`${timeStr}${text}`);
                        
                        // 如果是双语模式，添加原文
                        if (includeOriginal && line.translatedText) {
                            lines.push(`${timeStr}${line.text}`);
                        }
                    }
                });
            }
        });
        
        return lines.join('\n');
    }
    
    /**
     * 格式化时间为DB格式 ([mm:ss.xx])
     * @param {number} seconds - 秒数
     * @returns {string} - 格式化后的时间字符串
     * @private
     */
    _formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const centisecs = Math.round((seconds % 1) * 100);
        
        return `[${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}]`;
    }
    
    /**
     * 获取支持的文件扩展名
     * @returns {Array<string>} - 支持的文件扩展名数组
     */
    getSupportedExtensions() {
        return ['.db', '.lrc'];
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DBGenerator;
} else {
    // 浏览器环境全局导出
    window.DBGenerator = DBGenerator;
}
