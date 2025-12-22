/**
 * SRT 字幕解析器
 * 解析 SRT 格式的字幕文件，提取序号、时间戳和文本内容
 */
class SRTParser {
    /**
     * 解析 SRT 格式的字幕文本
     * @param {string} text - SRT 格式的字幕文本
     * @returns {Object} - 解析结果，包含字幕段落
     */
    parse(text) {
        // 处理不同换行符
        const normalizedText = text.replace(/\r\n/g, '\n');
        const lines = normalizedText.split('\n');
        const result = {
            subtitleLines: []
        };

        let currentSubtitle = null;
        let currentIndex = 0;

        lines.forEach((line, lineNum) => {
            line = line.trim();
            
            if (!line && currentSubtitle) {
                // 空行表示当前字幕结束
                result.subtitleLines.push({
                    ...currentSubtitle,
                    originalLines: lines.slice(currentSubtitle.startLine, lineNum)
                });
                currentSubtitle = null;
                return;
            }

            if (!currentSubtitle) {
                // 尝试解析序号
                const indexMatch = line.match(/^\d+$/);
                if (indexMatch) {
                    currentIndex = parseInt(indexMatch[0]);
                    currentSubtitle = {
                        index: currentIndex,
                        startLine: lineNum,
                        timeRange: '',
                        startTime: null,
                        endTime: null,
                        textLines: [],
                        translatedLines: []
                    };
                }
            } else if (!currentSubtitle.startTime) {
                // 解析时间范围（格式：00:01:23,456 --> 00:01:25,789）
                const timeMatch = line.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
                if (timeMatch) {
                    currentSubtitle.timeRange = line;
                    
                    // 解析开始时间
                    currentSubtitle.startTime = {
                        original: `${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3]},${timeMatch[4]}`,
                        hours: parseInt(timeMatch[1]),
                        minutes: parseInt(timeMatch[2]),
                        seconds: parseInt(timeMatch[3]),
                        milliseconds: parseInt(timeMatch[4]),
                        totalMilliseconds: this._toMilliseconds(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4])
                    };
                    
                    // 解析结束时间
                    currentSubtitle.endTime = {
                        original: `${timeMatch[5]}:${timeMatch[6]}:${timeMatch[7]},${timeMatch[8]}`,
                        hours: parseInt(timeMatch[5]),
                        minutes: parseInt(timeMatch[6]),
                        seconds: parseInt(timeMatch[7]),
                        milliseconds: parseInt(timeMatch[8]),
                        totalMilliseconds: this._toMilliseconds(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8])
                    };
                }
            } else {
                // 解析文本行
                if (line) {
                    currentSubtitle.textLines.push(line);
                    currentSubtitle.translatedLines.push('');
                }
            }
        });

        // 处理最后一个字幕段
        if (currentSubtitle) {
            result.subtitleLines.push({
                ...currentSubtitle,
                originalLines: lines.slice(currentSubtitle.startLine)
            });
        }

        return result;
    }

    /**
     * 根据解析结果生成 SRT 格式的字幕文本
     * @param {Object} parsedData - 解析结果对象
     * @param {boolean} includeOriginal - 是否包含原文（双语模式）
     * @returns {string} - 生成的 SRT 文本
     */
    generate(parsedData, includeOriginal = false) {
        const lines = [];

        parsedData.subtitleLines.forEach(subtitle => {
            // 添加序号
            lines.push(subtitle.index.toString());
            // 添加时间范围
            lines.push(subtitle.timeRange);
            
            // 添加文本行
            subtitle.textLines.forEach((text, index) => {
                const translated = subtitle.translatedLines[index] || text;
                lines.push(translated);
                
                // 如果是双语模式，添加原文
                if (includeOriginal && subtitle.translatedLines[index]) {
                    lines.push(text);
                }
            });
            
            // 添加空行分隔
            lines.push('');
        });

        return lines.join('\n');
    }

    /**
     * 检测文本是否为 SRT 格式
     * @param {string} text - 要检测的文本
     * @returns {boolean} - 是否为 SRT 格式
     */
    isSRTFormat(text) {
        // SRT 格式特征：序号 + 时间范围 + 文本
        const srtPattern = /^\d+\s*\n\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/m;
        return srtPattern.test(text);
    }

    /**
     * 获取支持的文件扩展名
     * @returns {Array<string>} - 支持的文件扩展名数组
     */
    getSupportedExtensions() {
        return ['.srt'];
    }

    /**
     * 将时间字符串转换为毫秒数
     * @private
     * @param {string} hours - 小时
     * @param {string} minutes - 分钟
     * @param {string} seconds - 秒
     * @param {string} milliseconds - 毫秒
     * @returns {number} - 总毫秒数
     */
    _toMilliseconds(hours, minutes, seconds, milliseconds) {
        return parseInt(hours) * 3600000 + 
               parseInt(minutes) * 60000 + 
               parseInt(seconds) * 1000 + 
               parseInt(milliseconds);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SRTParser;
} else {
    // 浏览器环境全局导出
    window.SRTParser = SRTParser;
}