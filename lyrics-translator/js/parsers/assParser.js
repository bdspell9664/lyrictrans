/**
 * ASS/SSA 字幕解析器
 * 解析 ASS/SSA 格式的字幕文件，提取样式信息和字幕内容
 */
class ASSParser {
    /**
     * 解析 ASS/SSA 格式的字幕文本
     * @param {string} text - ASS/SSA 格式的字幕文本
     * @returns {Object} - 解析结果，包含样式和字幕段落
     */
    parse(text) {
        // 处理不同换行符
        const normalizedText = text.replace(/\r\n/g, '\n');
        const lines = normalizedText.split('\n');
        const result = {
            headerLines: [],
            eventsSection: false,
            subtitles: [],
            styles: {},
            scriptInfo: {}
        };

        let currentSection = null;

        lines.forEach((line, index) => {
            // 处理注释行
            if (line.trim().startsWith(';')) {
                return;
            }

            // 处理章节标记
            const sectionMatch = line.match(/^\[(\w+)\]$/);
            if (sectionMatch) {
                currentSection = sectionMatch[1].toLowerCase();
                result.headerLines.push(line);
                return;
            }

            // 根据章节处理内容
            if (currentSection === 'script info') {
                // 解析脚本信息
                const infoMatch = line.match(/^([^:]+):\s*(.*)$/);
                if (infoMatch) {
                    const key = infoMatch[1].trim().toLowerCase();
                    const value = infoMatch[2].trim();
                    result.scriptInfo[key] = value;
                }
                result.headerLines.push(line);
            } else if (currentSection === 'v4 styles' || currentSection === 'v4+ styles') {
                // 解析样式信息
                if (line.toLowerCase().startsWith('format:')) {
                    result.headerLines.push(line);
                } else if (line.toLowerCase().startsWith('style:')) {
                    const styleParts = line.substring(6).split(',');
                    if (styleParts.length > 0) {
                        const styleName = styleParts[0].trim();
                        result.styles[styleName] = {
                            originalLine: line,
                            parts: styleParts
                        };
                        result.headerLines.push(line);
                    }
                } else {
                    result.headerLines.push(line);
                }
            } else if (currentSection === 'events') {
                // 解析事件（字幕内容）
                if (line.toLowerCase().startsWith('format:')) {
                    result.eventsFormat = line;
                    result.headerLines.push(line);
                } else if (line.toLowerCase().startsWith('dialogue:')) {
                    result.eventsSection = true;
                    const dialogueParts = this._splitASSLine(line.substring(9));
                    const subtitle = this._parseDialogue(dialogueParts, line, index);
                    result.subtitles.push(subtitle);
                } else {
                    result.headerLines.push(line);
                }
            } else {
                // 其他章节内容直接保留
                result.headerLines.push(line);
            }
        });

        return result;
    }

    /**
     * 根据解析结果生成 ASS/SSA 格式的字幕文本
     * @param {Object} parsedData - 解析结果对象
     * @param {boolean} includeOriginal - 是否包含原文（双语模式）
     * @returns {string} - 生成的 ASS/SSA 文本
     */
    generate(parsedData, includeOriginal = false) {
        const lines = [...parsedData.headerLines];

        // 添加字幕内容
        parsedData.subtitles.forEach(subtitle => {
            let dialogueLine = subtitle.originalLine;
            
            // 如果有翻译，替换文本内容
            if (subtitle.translatedText) {
                const dialogueParts = this._splitASSLine(subtitle.originalLine.substring(9));
                const textIndex = this._getDialogueTextIndex(dialogueParts);
                
                if (textIndex !== -1) {
                    let newText = subtitle.translatedText;
                    
                    // 如果是双语模式，添加原文
                    if (includeOriginal && subtitle.translatedText !== subtitle.text) {
                        newText = `${subtitle.translatedText}\N${subtitle.text}`;
                    }
                    
                    dialogueParts[textIndex] = newText;
                    dialogueLine = `Dialogue: ${dialogueParts.join(',')}`;
                }
            }
            
            lines.push(dialogueLine);
        });

        return lines.join('\n');
    }

    /**
     * 检测文本是否为 ASS/SSA 格式
     * @param {string} text - 要检测的文本
     * @returns {boolean} - 是否为 ASS/SSA 格式
     */
    isASSFormat(text) {
        // ASS/SSA 格式特征：包含 [Script Info] 章节和 Dialogue 行
        const hasScriptInfo = /^\[Script Info\]$/m.test(text);
        const hasDialogue = /^Dialogue:/m.test(text);
        return hasScriptInfo && hasDialogue;
    }

    /**
     * 获取支持的文件扩展名
     * @returns {Array<string>} - 支持的文件扩展名数组
     */
    getSupportedExtensions() {
        return ['.ass', '.ssa'];
    }

    /**
     * 解析 Dialogue 行
     * @private
     * @param {Array<string>} parts - 分割后的 Dialogue 部分
     * @param {string} originalLine - 原始行内容
     * @param {number} lineIndex - 行索引
     * @returns {Object} - 解析后的字幕对象
     */
    _parseDialogue(parts, originalLine, lineIndex) {
        const textIndex = this._getDialogueTextIndex(parts);
        const text = textIndex !== -1 ? parts.slice(textIndex).join(',') : '';
        
        return {
            originalLine: originalLine,
            lineIndex: lineIndex,
            parts: parts,
            text: text,
            translatedText: '',
            // 提取时间信息
            startTime: parts[1] || '',
            endTime: parts[2] || '',
            // 提取样式和说话者
            style: parts[3] || '',
            speaker: parts[4] || ''
        };
    }

    /**
     * 分割 ASS 行，处理引号内的逗号
     * @private
     * @param {string} line - 要分割的行
     * @returns {Array<string>} - 分割后的部分数组
     */
    _splitASSLine(line) {
        const parts = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
                current += char;
            } else if (char === ',' && !inQuotes) {
                parts.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        if (current) {
            parts.push(current.trim());
        }
        
        return parts;
    }

    /**
     * 获取 Dialogue 行中文本的起始索引
     * @private
     * @param {Array<string>} parts - Dialogue 行的部分数组
     * @returns {number} - 文本起始索引
     */
    _getDialogueTextIndex(parts) {
        // ASS 格式 Dialogue 行的标准格式：Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
        // 所以文本通常从索引 9 开始
        return Math.min(9, parts.length - 1);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASSParser;
}