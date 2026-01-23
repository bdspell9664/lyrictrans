/**
 * 时间轴管理器
 * 负责时间轴数据的保存、加载、验证和管理
 */
class TimelineManager {
    /**
     * 初始化时间轴管理器
     */
    constructor() {
        this.storagePrefix = 'lyrics_timeline_';
    }
    
    /**
     * 保存时间轴数据
     * @param {string} fileName - 文件名，用于标识时间轴数据
     * @param {Object} parsedData - 包含时间轴数据的解析结果
     * @returns {boolean} - 是否保存成功
     */
    saveTimeline(fileName, parsedData) {
        try {
            // 提取时间轴数据
            const timelineData = this._extractTimelineData(parsedData);
            
            // 验证时间轴数据
            if (!this._validateTimelineData(timelineData)) {
                console.error('时间轴数据验证失败，无法保存');
                return false;
            }
            
            // 生成唯一键名
            const storageKey = this._generateStorageKey(fileName);
            
            // 保存到本地存储
            localStorage.setItem(storageKey, JSON.stringify(timelineData));
            
            console.log('时间轴数据保存成功:', storageKey);
            return true;
        } catch (error) {
            console.error('保存时间轴数据失败:', error);
            return false;
        }
    }
    
    /**
     * 加载时间轴数据
     * @param {string} fileName - 文件名，用于标识时间轴数据
     * @returns {Object|null} - 加载的时间轴数据，或null如果加载失败
     */
    loadTimeline(fileName) {
        try {
            // 生成唯一键名
            const storageKey = this._generateStorageKey(fileName);
            
            // 从本地存储加载
            const storedData = localStorage.getItem(storageKey);
            
            if (!storedData) {
                console.log('未找到时间轴数据:', storageKey);
                return null;
            }
            
            const timelineData = JSON.parse(storedData);
            
            // 验证时间轴数据
            if (!this._validateTimelineData(timelineData)) {
                console.error('加载的时间轴数据无效，已损坏');
                return null;
            }
            
            console.log('时间轴数据加载成功:', storageKey);
            return timelineData;
        } catch (error) {
            console.error('加载时间轴数据失败:', error);
            return null;
        }
    }
    
    /**
     * 导出时间轴数据到文件
     * @param {Object} parsedData - 包含时间轴数据的解析结果
     * @param {string} fileName - 文件名
     */
    exportTimeline(parsedData, fileName) {
        try {
            // 提取时间轴数据
            const timelineData = this._extractTimelineData(parsedData);
            
            // 验证时间轴数据
            if (!this._validateTimelineData(timelineData)) {
                console.error('时间轴数据验证失败，无法导出');
                return;
            }
            
            // 转换为JSON字符串
            const jsonStr = JSON.stringify(timelineData, null, 2);
            
            // 创建Blob并下载
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName.replace(/\.[^/.]+$/, '')}.timeline.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('时间轴数据导出成功:', fileName);
        } catch (error) {
            console.error('导出时间轴数据失败:', error);
        }
    }
    
    /**
     * 导入时间轴数据
     * @param {File} file - 包含时间轴数据的文件
     * @returns {Promise<Object|null>} - 导入的时间轴数据，或null如果导入失败
     */
    importTimeline(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const timelineData = JSON.parse(e.target.result);
                    
                    // 验证时间轴数据
                    if (!this._validateTimelineData(timelineData)) {
                        console.error('导入的时间轴数据无效');
                        resolve(null);
                        return;
                    }
                    
                    console.log('时间轴数据导入成功:', file.name);
                    resolve(timelineData);
                } catch (error) {
                    console.error('解析时间轴数据失败:', error);
                    resolve(null);
                }
            };
            
            reader.onerror = (error) => {
                console.error('读取时间轴文件失败:', error);
                resolve(null);
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * 应用时间轴数据到解析结果
     * @param {Object} parsedData - 解析结果
     * @param {Object} timelineData - 时间轴数据
     * @returns {Object} - 更新后的解析结果
     */
    applyTimelineData(parsedData, timelineData) {
        try {
            // 验证时间轴数据
            if (!this._validateTimelineData(timelineData)) {
                console.error('应用的时间轴数据无效');
                return parsedData;
            }
            
            // 应用时间轴数据
            const updatedParsedData = JSON.parse(JSON.stringify(parsedData));
            
            // 遍历所有歌词行
            updatedParsedData.lyricLines.forEach((line, index) => {
                if (line.type === 'lyric' && timelineData.timeline[index]) {
                    // 应用时间轴数据
                    line.wordTimestamps = timelineData.timeline[index].wordTimestamps;
                }
            });
            
            console.log('时间轴数据应用成功');
            return updatedParsedData;
        } catch (error) {
            console.error('应用时间轴数据失败:', error);
            return parsedData;
        }
    }
    
    /**
     * 列出所有保存的时间轴数据
     * @returns {Array<Object>} - 保存的时间轴数据列表
     */
    listTimelines() {
        const timelines = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.storagePrefix)) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    timelines.push({
                        key: key,
                        fileName: this._extractFileNameFromKey(key),
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                        lineCount: data.timeline.length
                    });
                } catch (error) {
                    console.error('读取时间轴数据失败:', key, error);
                }
            }
        }
        
        // 按更新时间排序
        return timelines.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
    
    /**
     * 删除时间轴数据
     * @param {string} fileName - 文件名，用于标识时间轴数据
     * @returns {boolean} - 是否删除成功
     */
    deleteTimeline(fileName) {
        try {
            const storageKey = this._generateStorageKey(fileName);
            localStorage.removeItem(storageKey);
            console.log('时间轴数据删除成功:', storageKey);
            return true;
        } catch (error) {
            console.error('删除时间轴数据失败:', error);
            return false;
        }
    }
    
    /**
     * 清除所有时间轴数据
     * @returns {boolean} - 是否清除成功
     */
    clearAllTimelines() {
        try {
            let deletedCount = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.storagePrefix)) {
                    localStorage.removeItem(key);
                    deletedCount++;
                }
            }
            
            console.log(`已清除 ${deletedCount} 条时间轴数据`);
            return true;
        } catch (error) {
            console.error('清除时间轴数据失败:', error);
            return false;
        }
    }
    
    /**
     * 提取时间轴数据
     * @param {Object} parsedData - 包含时间轴数据的解析结果
     * @returns {Object} - 提取的时间轴数据
     * @private
     */
    _extractTimelineData(parsedData) {
        const timeline = [];
        
        // 遍历所有歌词行，提取时间轴数据
        parsedData.lyricLines.forEach((line) => {
            if (line.type === 'lyric') {
                timeline.push({
                    text: line.text,
                    timestamps: line.timestamps,
                    wordTimestamps: line.wordTimestamps || []
                });
            } else {
                // 非歌词行也需要保存，以保持结构一致性
                timeline.push({
                    type: line.type,
                    text: line.text,
                    wordTimestamps: []
                });
            }
        });
        
        // 创建时间轴数据对象
        return {
            version: '1.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: parsedData.metadata || {},
            timeline: timeline
        };
    }
    
    /**
     * 验证时间轴数据
     * @param {Object} timelineData - 时间轴数据
     * @returns {boolean} - 是否有效
     * @private
     */
    _validateTimelineData(timelineData) {
        // 基本结构验证
        if (!timelineData || typeof timelineData !== 'object') {
            return false;
        }
        
        if (!timelineData.timeline || !Array.isArray(timelineData.timeline)) {
            return false;
        }
        
        // 验证每个时间轴项
        for (const item of timelineData.timeline) {
            if (!item) {
                continue;
            }
            
            // 验证wordTimestamps结构
            if (item.wordTimestamps && Array.isArray(item.wordTimestamps)) {
                for (const wordTimestamp of item.wordTimestamps) {
                    if (!wordTimestamp.word || typeof wordTimestamp.startTime !== 'number' || typeof wordTimestamp.endTime !== 'number') {
                        return false;
                    }
                    
                    // 验证时间顺序
                    if (wordTimestamp.startTime > wordTimestamp.endTime) {
                        return false;
                    }
                    
                    // 验证时间精度（确保为有效数值）
                    if (isNaN(wordTimestamp.startTime) || isNaN(wordTimestamp.endTime)) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    /**
     * 优化时间轴精度
     * @param {Object} parsedData - 解析结果
     * @returns {Object} - 优化后的解析结果
     */
    optimizeTimelineAccuracy(parsedData) {
        try {
            // 克隆数据以避免直接修改原数据
            const optimizedData = JSON.parse(JSON.stringify(parsedData));
            
            // 遍历所有歌词行，优化时间戳精度
            if (optimizedData.lyricLines) {
                optimizedData.lyricLines.forEach((line) => {
                    if (line.type === 'lyric') {
                        // 优化行时间戳精度
                        if (line.timestamps) {
                            line.timestamps.forEach((timestamp) => {
                                if (timestamp.totalMilliseconds) {
                                    // 保留3位小数精度（毫秒级精度）
                                    timestamp.totalMilliseconds = parseFloat(timestamp.totalMilliseconds.toFixed(3));
                                }
                            });
                        }
                        
                        // 优化逐字时间戳精度
                        if (line.wordTimestamps) {
                            line.wordTimestamps.forEach((wordTimestamp) => {
                                // 保留3位小数精度（毫秒级精度）
                                wordTimestamp.startTime = parseFloat(wordTimestamp.startTime.toFixed(3));
                                wordTimestamp.endTime = parseFloat(wordTimestamp.endTime.toFixed(3));
                            });
                        }
                    }
                });
            }
            
            console.log('时间轴精度优化完成');
            return optimizedData;
        } catch (error) {
            console.error('优化时间轴精度失败:', error);
            return parsedData;
        }
    }
    
    /**
     * 生成存储键名
     * @param {string} fileName - 文件名
     * @returns {string} - 存储键名
     * @private
     */
    _generateStorageKey(fileName) {
        // 使用文件名的哈希值作为键名，避免特殊字符问题
        const hash = this._generateHash(fileName);
        return `${this.storagePrefix}${hash}`;
    }
    
    /**
     * 从存储键名中提取文件名
     * @param {string} storageKey - 存储键名
     * @returns {string} - 文件名
     * @private
     */
    _extractFileNameFromKey(storageKey) {
        // 移除前缀后尝试解析
        const keyWithoutPrefix = storageKey.replace(this.storagePrefix, '');
        return keyWithoutPrefix;
    }
    
    /**
     * 生成字符串哈希值
     * @param {string} str - 输入字符串
     * @returns {string} - 哈希值
     * @private
     */
    _generateHash(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return Math.abs(hash).toString();
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimelineManager;
} else {
    // 浏览器环境全局导出
    window.TimelineManager = TimelineManager;
}
