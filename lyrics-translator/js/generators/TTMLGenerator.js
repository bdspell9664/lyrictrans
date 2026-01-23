/**
 * TTML (Timed Text Markup Language) 格式生成器
 * 将LRC格式的歌词转换为TTML格式
 */
class TTMLGenerator {
    /**
     * 生成TTML格式的歌词文本
     * @param {Object} parsedData - 解析后的歌词数据
     * @param {boolean} includeOriginal - 是否包含原文（双语模式）
     * @returns {string} - 生成的TTML文本
     */
    generate(parsedData, includeOriginal = false) {
        const lines = [];
        
        // TTML格式开头
        lines.push('<?xml version="1.0" encoding="UTF-8"?>');
        lines.push('<tt xmlns="http://www.w3.org/ns/ttml" xmlns:tts="http://www.w3.org/ns/ttml#styling" xmlns:ttp="http://www.w3.org/ns/ttml#parameter" ttp:timeBase="media" ttp:contentType="text/speech" xml:lang="zh-CN">');
        
        // 添加头部信息
        lines.push('  <head>');
        lines.push('    <metadata>');
        if (parsedData.metadata) {
            for (const [key, value] of Object.entries(parsedData.metadata)) {
                lines.push(`      <ttm:title xmlns:ttm="http://www.w3.org/ns/ttml#metadata">${this._escapeXml(value)}</ttm:title>`);
            }
        }
        lines.push('    </metadata>');
        
        // 添加样式定义
        lines.push('    <styling>');
        lines.push('      <style id="default" tts:fontSize="24pt" tts:fontFamily="Arial" tts:fontWeight="normal" tts:fontStyle="normal" tts:textAlign="center" tts:color="#FFFFFF" tts:backgroundColor="transparent" />');
        lines.push('      <style id="highlight" tts:fontSize="24pt" tts:fontFamily="Arial" tts:fontWeight="bold" tts:fontStyle="normal" tts:textAlign="center" tts:color="#FF0000" tts:backgroundColor="transparent" />');
        lines.push('      <style id="translation" tts:fontSize="18pt" tts:fontFamily="Arial" tts:fontWeight="normal" tts:fontStyle="normal" tts:textAlign="center" tts:color="#CCCCCC" tts:backgroundColor="transparent" />');
        lines.push('    </styling>');
        
        // 添加布局定义
        lines.push('    <layout>');
        lines.push('      <region id="region0" tts:origin="0% 0%" tts:extent="100% 100%" tts:padding="20px" />');
        lines.push('      <region id="current" tts:origin="0% 40%" tts:extent="100% 20%" tts:padding="10px" />');
        lines.push('      <region id="next" tts:origin="0% 60%" tts:extent="100% 20%" tts:padding="10px" />');
        lines.push('    </layout>');
        lines.push('  </head>');
        
        // 添加正文内容
        lines.push('  <body region="region0" style="default">');
        lines.push('    <div>');
        
        // 处理每一行歌词
        let prevEndTime = 0;
        parsedData.lyricLines.forEach((line, index) => {
            if (line.type === 'lyric') {
                line.timestamps.forEach(timestamp => {
                    const startTime = timestamp.totalMilliseconds / 1000;
                    const startTimeStr = this._formatTime(startTime);
                    
                    // 计算结束时间（使用下一行的开始时间或默认10秒）
                    let endTime = startTime + 10; // 默认持续10秒
                    if (index < parsedData.lyricLines.length - 1) {
                        const nextLine = parsedData.lyricLines[index + 1];
                        if (nextLine.type === 'lyric' && nextLine.timestamps.length > 0) {
                            endTime = nextLine.timestamps[0].totalMilliseconds / 1000;
                        }
                    }
                    
                    const endTimeStr = this._formatTime(endTime);
                    
                    if (line.wordTimestamps && line.wordTimestamps.length > 0) {
                        // 逐字歌词格式
                        lines.push(`      <p begin="${startTimeStr}" end="${endTimeStr}" region="current">`);
                        
                        // 处理每个字的时间戳
                        line.wordTimestamps.forEach((wordTimestamp, wordIndex) => {
                            const wordStartTime = wordTimestamp.startTime / 1000;
                            const wordStartTimeStr = this._formatTime(wordStartTime);
                            const wordEndTime = (wordTimestamp.startTime + wordTimestamp.duration) / 1000;
                            const wordEndTimeStr = this._formatTime(wordEndTime);
                            
                            lines.push(`        <span begin="${wordStartTimeStr}" end="${wordEndTimeStr}" style="highlight">${this._escapeXml(wordTimestamp.word)}</span>`);
                        });
                        
                        lines.push('      </p>');
                        
                        // 如果是双语模式，添加翻译
                        if (includeOriginal && line.translatedText) {
                            lines.push(`      <p begin="${startTimeStr}" end="${endTimeStr}" region="next" style="translation">${this._escapeXml(line.translatedText)}</p>`);
                        }
                    } else {
                        // 普通歌词格式
                        const text = line.translatedText || line.text;
                        lines.push(`      <p begin="${startTimeStr}" end="${endTimeStr}" region="current">${this._escapeXml(text)}</p>`);
                        
                        // 如果是双语模式，添加原文
                        if (includeOriginal && line.translatedText) {
                            lines.push(`      <p begin="${startTimeStr}" end="${endTimeStr}" region="next" style="translation">${this._escapeXml(line.text)}</p>`);
                        }
                    }
                    
                    prevEndTime = endTime;
                });
            }
        });
        
        // TTML格式结尾
        lines.push('    </div>');
        lines.push('  </body>');
        lines.push('</tt>');
        
        return lines.join('\n');
    }
    
    /**
     * 格式化时间为TTML格式 (HH:MM:SS.mmm)
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
        return ['.ttml'];
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TTMLGenerator;
} else {
    // 浏览器环境全局导出
    window.TTMLGenerator = TTMLGenerator;
}
