/**
 * AMLL (Advanced Music Lyrics Language) 格式生成器
 * 将LRC格式的歌词转换为AMLL格式
 */
class AMLLGenerator {
    /**
     * 生成AMLL格式的歌词文本
     * @param {Object} parsedData - 解析后的歌词数据
     * @param {boolean} includeOriginal - 是否包含原文（双语模式）
     * @returns {string} - 生成的AMLL文本
     */
    generate(parsedData, includeOriginal = false) {
        const lines = [];
        
        // AMLL格式开头
        lines.push('<?xml version="1.0" encoding="UTF-8"?>');
        lines.push('<amll version="1.0">');
        
        // 添加元数据
        lines.push('  <head>');
        if (parsedData.metadata) {
            for (const [key, value] of Object.entries(parsedData.metadata)) {
                lines.push(`    <meta name="${key}" content="${this._escapeXml(value)}" />`);
            }
        }
        lines.push('    <style>');
        lines.push('      <default styleId="default">');
        lines.push('        <fontSize>24</fontSize>');
        lines.push('        <fontColor>#FFFFFF</fontColor>');
        lines.push('        <backgroundColor>#000000</backgroundColor>');
        lines.push('        <highlightColor>#FF0000</highlightColor>');
        lines.push('        <alignment>center</alignment>');
        lines.push('        <fontFamily>Arial</fontFamily>');
        lines.push('      </default>');
        lines.push('    </style>');
        lines.push('  </head>');
        
        // 添加歌词主体
        lines.push('  <body>');
        lines.push('    <lyrics styleId="default">');
        
        // 处理每一行歌词
        parsedData.lyricLines.forEach(line => {
            if (line.type === 'lyric') {
                line.timestamps.forEach(timestamp => {
                    const timeInSeconds = timestamp.totalMilliseconds / 1000;
                    const timeStr = this._formatTime(timeInSeconds);
                    
                    if (line.wordTimestamps && line.wordTimestamps.length > 0) {
                        // 逐字歌词格式
                        lines.push(`      <line time="${timeStr}">`);
                        
                        // 处理每个字的时间戳
                        line.wordTimestamps.forEach(wordTimestamp => {
                            const wordTimeInSeconds = wordTimestamp.startTime / 1000;
                            const wordTimeStr = this._formatTime(wordTimeInSeconds);
                            const duration = wordTimestamp.duration / 1000;
                            const durationStr = this._formatDuration(duration);
                            
                            lines.push(`        <word time="${wordTimeStr}" duration="${durationStr}">${this._escapeXml(wordTimestamp.word)}</word>`);
                        });
                        
                        lines.push('      </line>');
                        
                        // 如果是双语模式，添加翻译
                        if (includeOriginal && line.translatedText) {
                            lines.push(`      <line time="${timeStr}" type="translation">`);
                            lines.push(`        <text>${this._escapeXml(line.translatedText)}</text>`);
                            lines.push('      </line>');
                        }
                    } else {
                        // 普通歌词格式
                        const text = line.translatedText || line.text;
                        lines.push(`      <line time="${timeStr}">`);
                        lines.push(`        <text>${this._escapeXml(text)}</text>`);
                        lines.push('      </line>');
                        
                        // 如果是双语模式，添加原文
                        if (includeOriginal && line.translatedText) {
                            lines.push(`      <line time="${timeStr}" type="original">`);
                            lines.push(`        <text>${this._escapeXml(line.text)}</text>`);
                            lines.push('      </line>');
                        }
                    }
                });
            }
        });
        
        // AMLL格式结尾
        lines.push('    </lyrics>');
        lines.push('  </body>');
        lines.push('</amll>');
        
        return lines.join('\n');
    }
    
    /**
     * 格式化时间为AMLL格式 (HH:MM:SS.mmm)
     * @param {number} seconds - 秒数
     * @returns {string} - 格式化后的时间字符串
     * @private
     */
    _formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.round((seconds % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
    }
    
    /**
     * 格式化持续时间为AMLL格式 (SS.mmm)
     * @param {number} seconds - 秒数
     * @returns {string} - 格式化后的持续时间字符串
     * @private
     */
    _formatDuration(seconds) {
        const secs = Math.floor(seconds);
        const millis = Math.round((seconds % 1) * 1000);
        
        return `${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
    }
    
    /**
     * 转义XML特殊字符
     * @param {string} str - 要转义的字符串
     * @returns {string} - 转义后的字符串
     * @private
     */
    _escapeXml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    
    /**
     * 获取支持的文件扩展名
     * @returns {Array<string>} - 支持的文件扩展名数组
     */
    getSupportedExtensions() {
        return ['.amll'];
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AMLLGenerator;
} else {
    // 浏览器环境全局导出
    window.AMLLGenerator = AMLLGenerator;
}
