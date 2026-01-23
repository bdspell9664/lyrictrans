/**
 * 逐字歌词播放器
 * 实现KTV式逐字高亮播放效果
 */
class WordByWordPlayer {
    /**
     * 初始化逐字歌词播放器
     * @param {Object} options - 配置选项
     * @param {AudioElement} options.audioElement - 音频元素
     * @param {Object} options.parsedData - 解析后的歌词数据
     * @param {HTMLElement} options.currentLineElement - 当前行显示元素
     * @param {HTMLElement} options.nextLineElement - 下一行显示元素
     * @param {HTMLElement} options.lyricsContainer - 歌词容器元素
     * @param {function} options.onLineChange - 行切换回调函数
     * @param {function} options.onWordChange - 字切换回调函数
     */
    constructor(options) {
        this.audioElement = options.audioElement;
        this.parsedData = options.parsedData;
        this.currentLineElement = options.currentLineElement;
        this.nextLineElement = options.nextLineElement;
        this.lyricsContainer = options.lyricsContainer;
        this.onLineChange = options.onLineChange || (() => {});
        this.onWordChange = options.onWordChange || (() => {});
        
        // 状态管理
        this.isPlaying = false;
        this.currentLineIndex = 0;
        this.currentWordIndex = 0;
        this.playbackSpeed = 1.0;
        this.currentTime = 0;
        this.lastUpdateTime = 0;
        
        // 歌词数据预处理
        this.lyricLines = this._preprocessLyrics(this.parsedData);
        
        // 初始化样式
        this._initStyles();
        
        // 绑定事件
        this._bindEvents();
        
        // 开始更新循环
        this._startUpdateLoop();
    }
    
    /**
     * 预处理歌词数据，提取需要逐字播放的行
     * @param {Object} parsedData - 解析后的歌词数据
     * @returns {Array} - 预处理后的歌词行数组
     * @private
     */
    _preprocessLyrics(parsedData) {
        const lyricLines = [];
        
        parsedData.lyricLines.forEach((line, index) => {
            if (line.type === 'lyric' && line.timestamps && line.timestamps.length > 0) {
                // 获取该行的开始时间
                const startTime = line.timestamps[0].totalMilliseconds;
                
                // 计算结束时间（使用下一行的开始时间或默认10秒）
                let endTime = startTime + 10000; // 默认持续10秒
                if (index < parsedData.lyricLines.length - 1) {
                    const nextLine = parsedData.lyricLines[index + 1];
                    if (nextLine.type === 'lyric' && nextLine.timestamps && nextLine.timestamps.length > 0) {
                        endTime = nextLine.timestamps[0].totalMilliseconds;
                    }
                }
                
                // 准备逐字播放的数据
                let wordTimestamps = [];
                if (line.wordTimestamps && line.wordTimestamps.length > 0) {
                    wordTimestamps = line.wordTimestamps;
                } else {
                    // 如果没有逐字时间戳，生成默认的均匀分配时间戳
                    const words = line.text.split('');
                    const duration = endTime - startTime;
                    const wordDuration = duration / words.length;
                    
                    wordTimestamps = words.map((word, wordIndex) => {
                        const wordStartTime = startTime + (wordIndex * wordDuration);
                        return {
                            word: word,
                            startTime: wordStartTime,
                            endTime: wordStartTime + wordDuration
                        };
                    });
                }
                
                lyricLines.push({
                    index: index,
                    text: line.text,
                    translatedText: line.translatedText || '',
                    startTime: startTime,
                    endTime: endTime,
                    wordTimestamps: wordTimestamps,
                    wordCount: wordTimestamps.length
                });
            }
        });
        
        // 按时间排序
        return lyricLines.sort((a, b) => a.startTime - b.startTime);
    }
    
    /**
     * 初始化样式
     * @private
     */
    _initStyles() {
        // 确保当前行元素存在
        if (this.currentLineElement) {
            this.currentLineElement.style.fontSize = '24px';
            this.currentLineElement.style.fontWeight = 'bold';
            this.currentLineElement.style.textAlign = 'center';
            this.currentLineElement.style.color = '#FFFFFF';
            this.currentLineElement.style.margin = '20px 0';
        }
        
        if (this.nextLineElement) {
            this.nextLineElement.style.fontSize = '18px';
            this.nextLineElement.style.fontWeight = 'normal';
            this.nextLineElement.style.textAlign = 'center';
            this.nextLineElement.style.color = '#CCCCCC';
            this.nextLineElement.style.margin = '20px 0';
        }
        
        if (this.lyricsContainer) {
            this.lyricsContainer.style.height = '300px';
            this.lyricsContainer.style.overflowY = 'auto';
            this.lyricsContainer.style.textAlign = 'center';
            this.lyricsContainer.style.padding = '20px';
        }
        
        // 创建样式表
        this._createStyleSheet();
    }
    
    /**
     * 创建样式表
     * @private
     */
    _createStyleSheet() {
        // 检查是否已存在样式表
        if (document.getElementById('word-by-word-styles')) {
            return;
        }
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'word-by-word-styles';
        styleSheet.textContent = `
            /* 逐字高亮样式 */
            .word-by-word-container {
                font-family: Arial, sans-serif;
                background-color: rgba(0, 0, 0, 0.8);
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            
            .word-by-word-line {
                margin: 10px 0;
                padding: 5px 0;
                transition: all 0.3s ease;
            }
            
            .word-by-word-line.current {
                font-size: 24px;
                font-weight: bold;
                color: #FFFFFF;
                transform: scale(1.1);
            }
            
            .word-by-word-line.next {
                font-size: 18px;
                color: #CCCCCC;
            }
            
            .word-by-word-line.previous {
                font-size: 16px;
                color: #888888;
            }
            
            .word-by-word-text {
                white-space: pre-wrap;
                word-break: break-all;
            }
            
            .word-by-word-translation {
                font-size: 14px;
                color: #AAAAAA;
                margin-top: 5px;
            }
            
            /* 逐字高亮效果 */
            .word-by-word-word {
                transition: color 0.3s ease;
                display: inline-block;
                position: relative;
            }
            
            .word-by-word-word.highlighted {
                color: #FF0000;
                transform: scale(1.1);
                text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
            }
            
            .word-by-word-word.current {
                color: #FFFF00;
                font-weight: bold;
                text-shadow: 0 0 10px rgba(255, 255, 0, 0.8);
            }
            
            /* 滚动条样式 */
            .word-by-word-container::-webkit-scrollbar {
                width: 8px;
            }
            
            .word-by-word-container::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }
            
            .word-by-word-container::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
            }
            
            .word-by-word-container::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }
        `;
        
        document.head.appendChild(styleSheet);
    }
    
    /**
     * 绑定事件监听器
     * @private
     */
    _bindEvents() {
        if (this.audioElement) {
            this.audioElement.addEventListener('play', () => {
                this.isPlaying = true;
                this.lastUpdateTime = Date.now();
            });
            
            this.audioElement.addEventListener('pause', () => {
                this.isPlaying = false;
            });
            
            this.audioElement.addEventListener('ended', () => {
                this.isPlaying = false;
                this._reset();
            });
            
            this.audioElement.addEventListener('timeupdate', () => {
                this.currentTime = this.audioElement.currentTime * 1000; // 转换为毫秒
            });
            
            this.audioElement.addEventListener('ratechange', () => {
                this.playbackSpeed = this.audioElement.playbackRate;
            });
        }
    }
    
    /**
     * 开始更新循环
     * @private
     */
    _startUpdateLoop() {
        const update = () => {
            this._update();
            requestAnimationFrame(update);
        };
        update();
    }
    
    /**
     * 更新逐字播放状态
     * @private
     */
    _update() {
        if (!this.isPlaying || !this.lyricLines || this.lyricLines.length === 0) {
            return;
        }
        
        // 查找当前应该播放的行
        const currentLine = this._findCurrentLine(this.currentTime);
        if (!currentLine) {
            return;
        }
        
        // 更新当前行
        if (currentLine.index !== this.currentLineIndex) {
            this._updateCurrentLine(currentLine);
        }
        
        // 更新逐字高亮
        this._updateWordHighlight(currentLine);
    }
    
    /**
     * 查找当前时间对应的歌词行
     * @param {number} time - 当前时间（毫秒）
     * @returns {Object|null} - 当前歌词行，或null如果没有找到
     * @private
     */
    _findCurrentLine(time) {
        for (let i = this.lyricLines.length - 1; i >= 0; i--) {
            const line = this.lyricLines[i];
            if (time >= line.startTime) {
                return {
                    ...line,
                    index: i
                };
            }
        }
        return null;
    }
    
    /**
     * 更新当前行显示
     * @param {Object} currentLine - 当前歌词行
     * @private
     */
    _updateCurrentLine(currentLine) {
        this.currentLineIndex = currentLine.index;
        this.currentWordIndex = 0;
        
        // 更新UI
        this._renderCurrentLine(currentLine);
        this._renderNextLine(this.currentLineIndex + 1);
        
        // 滚动到当前行
        this._scrollToCurrentLine();
        
        // 调用回调
        this.onLineChange(currentLine, this.currentLineIndex);
    }
    
    /**
     * 渲染当前行
     * @param {Object} line - 歌词行数据
     * @private
     */
    _renderCurrentLine(line) {
        if (!this.currentLineElement) {
            return;
        }
        
        // 清空当前内容
        this.currentLineElement.innerHTML = '';
        
        // 创建行容器
        const lineContainer = document.createElement('div');
        lineContainer.className = 'word-by-word-line current';
        
        // 创建文本容器
        const textContainer = document.createElement('div');
        textContainer.className = 'word-by-word-text';
        
        // 逐字渲染
        line.wordTimestamps.forEach((wordTimestamp, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word-by-word-word';
            wordSpan.textContent = wordTimestamp.word;
            wordSpan.dataset.index = index;
            wordSpan.dataset.startTime = wordTimestamp.startTime;
            wordSpan.dataset.endTime = wordTimestamp.endTime;
            textContainer.appendChild(wordSpan);
        });
        
        lineContainer.appendChild(textContainer);
        
        // 添加翻译（如果有）
        if (line.translatedText) {
            const translationDiv = document.createElement('div');
            translationDiv.className = 'word-by-word-translation';
            translationDiv.textContent = line.translatedText;
            lineContainer.appendChild(translationDiv);
        }
        
        this.currentLineElement.appendChild(lineContainer);
    }
    
    /**
     * 渲染下一行
     * @param {number} lineIndex - 下一行索引
     * @private
     */
    _renderNextLine(lineIndex) {
        if (!this.nextLineElement || lineIndex >= this.lyricLines.length) {
            this.nextLineElement.innerHTML = '';
            return;
        }
        
        const nextLine = this.lyricLines[lineIndex];
        
        // 清空当前内容
        this.nextLineElement.innerHTML = '';
        
        // 创建行容器
        const lineContainer = document.createElement('div');
        lineContainer.className = 'word-by-word-line next';
        
        // 创建文本容器
        const textContainer = document.createElement('div');
        textContainer.className = 'word-by-word-text';
        textContainer.textContent = nextLine.text;
        lineContainer.appendChild(textContainer);
        
        // 添加翻译（如果有）
        if (nextLine.translatedText) {
            const translationDiv = document.createElement('div');
            translationDiv.className = 'word-by-word-translation';
            translationDiv.textContent = nextLine.translatedText;
            lineContainer.appendChild(translationDiv);
        }
        
        this.nextLineElement.appendChild(lineContainer);
    }
    
    /**
     * 更新逐字高亮
     * @param {Object} currentLine - 当前歌词行
     * @private
     */
    _updateWordHighlight(currentLine) {
        if (!this.currentLineElement || !currentLine.wordTimestamps) {
            return;
        }
        
        const wordSpans = this.currentLineElement.querySelectorAll('.word-by-word-word');
        let currentWordIndex = -1;
        
        // 查找当前应该高亮的字
        for (let i = 0; i < currentLine.wordTimestamps.length; i++) {
            const wordTimestamp = currentLine.wordTimestamps[i];
            if (this.currentTime >= wordTimestamp.startTime && this.currentTime <= wordTimestamp.endTime) {
                currentWordIndex = i;
                break;
            } else if (this.currentTime > wordTimestamp.endTime) {
                currentWordIndex = i;
            }
        }
        
        // 更新高亮状态
        wordSpans.forEach((span, index) => {
            span.classList.remove('highlighted', 'current');
            
            if (index < currentWordIndex) {
                span.classList.add('highlighted');
            } else if (index === currentWordIndex) {
                span.classList.add('current');
            }
        });
        
        // 调用回调
        if (currentWordIndex !== this.currentWordIndex) {
            this.currentWordIndex = currentWordIndex;
            this.onWordChange(currentWordIndex, currentLine.wordTimestamps[currentWordIndex]);
        }
    }
    
    /**
     * 滚动到当前行
     * @private
     */
    _scrollToCurrentLine() {
        if (!this.lyricsContainer) {
            return;
        }
        
        // 计算滚动位置
        const currentLineElement = this.lyricsContainer.querySelector('.word-by-word-line.current');
        if (currentLineElement) {
            const containerHeight = this.lyricsContainer.clientHeight;
            const lineHeight = currentLineElement.offsetHeight;
            const lineTop = currentLineElement.offsetTop;
            
            // 滚动到容器中间位置
            this.lyricsContainer.scrollTop = lineTop - containerHeight / 2 + lineHeight / 2;
        }
    }
    
    /**
     * 重置播放器状态
     * @private
     */
    _reset() {
        this.currentLineIndex = 0;
        this.currentWordIndex = 0;
        this.currentTime = 0;
        this.isPlaying = false;
        
        // 重置UI
        if (this.currentLineElement) {
            this.currentLineElement.innerHTML = '';
        }
        if (this.nextLineElement) {
            this.nextLineElement.innerHTML = '';
        }
    }
    
    /**
     * 设置播放速度
     * @param {number} speed - 播放速度，1.0为正常速度
     */
    setPlaybackSpeed(speed) {
        this.playbackSpeed = speed;
        if (this.audioElement) {
            this.audioElement.playbackRate = speed;
        }
    }
    
    /**
     * 获取当前播放速度
     * @returns {number} - 当前播放速度
     */
    getPlaybackSpeed() {
        return this.playbackSpeed;
    }
    
    /**
     * 跳转到指定时间
     * @param {number} time - 目标时间（毫秒）
     */
    seek(time) {
        this.currentTime = time;
        if (this.audioElement) {
            this.audioElement.currentTime = time / 1000;
        }
        
        // 重置当前行和字索引
        const currentLine = this._findCurrentLine(time);
        if (currentLine) {
            this._updateCurrentLine(currentLine);
            this._updateWordHighlight(currentLine);
        }
    }
    
    /**
     * 跳转到指定行
     * @param {number} lineIndex - 目标行索引
     */
    seekToLine(lineIndex) {
        if (lineIndex < 0 || lineIndex >= this.lyricLines.length) {
            return;
        }
        
        const line = this.lyricLines[lineIndex];
        this.seek(line.startTime);
    }
    
    /**
     * 获取当前播放状态
     * @returns {Object} - 当前播放状态
     */
    getCurrentState() {
        return {
            isPlaying: this.isPlaying,
            currentLineIndex: this.currentLineIndex,
            currentWordIndex: this.currentWordIndex,
            currentTime: this.currentTime,
            playbackSpeed: this.playbackSpeed,
            totalLines: this.lyricLines.length
        };
    }
    
    /**
     * 销毁播放器，清理资源
     */
    destroy() {
        this.isPlaying = false;
        
        // 解绑事件
        if (this.audioElement) {
            this.audioElement.removeEventListener('play', this._onPlay);
            this.audioElement.removeEventListener('pause', this._onPause);
            this.audioElement.removeEventListener('ended', this._onEnded);
            this.audioElement.removeEventListener('timeupdate', this._onTimeUpdate);
            this.audioElement.removeEventListener('ratechange', this._onRateChange);
        }
        
        // 清理DOM
        if (this.currentLineElement) {
            this.currentLineElement.innerHTML = '';
        }
        if (this.nextLineElement) {
            this.nextLineElement.innerHTML = '';
        }
        
        // 清理样式
        const styleSheet = document.getElementById('word-by-word-styles');
        if (styleSheet) {
            styleSheet.remove();
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordByWordPlayer;
} else {
    // 浏览器环境全局导出
    window.WordByWordPlayer = WordByWordPlayer;
}
