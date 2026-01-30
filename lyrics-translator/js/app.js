

/**
 * 歌词翻译应用主逻辑
 */
class LyricTranslatorApp {
    /**
     * 初始化应用
     */
    constructor() {
        // 应用版本号
        this.version = '1.0.0';
        
        this.uploadedFiles = [];
        this.currentFileIndex = 0;
        this.parsedData = null;
        this.parser = null;
        try {
            console.log('AIService:', typeof AIService);
            this.aiService = new AIService();
        } catch (error) {
            console.error('AIService初始化失败:', error);
            // 创建一个简单的模拟AIService，确保应用程序能够运行
            this.aiService = {
                translate: async (text, targetLang, sourceLang) => {
                    return text.split('\n').map(line => `${line} [模拟翻译]`).join('\n');
                },
                translateLyricLines: async (lyricLines, targetLang) => {
                    return lyricLines.map(line => {
                        if (line.type === 'lyric') {
                            return {
                                ...line,
                                translatedText: `${line.text} [模拟翻译]`
                            };
                        }
                        return line;
                    });
                }
            };
        }
        this.parserManager = new ParserManager();
        
        // 初始化时间轴管理器
        this.timelineManager = typeof TimelineManager !== 'undefined' ? new TimelineManager() : null;
        
        // 代理状态管理
        this.proxyStatus = 'unknown';
        this.proxyWebSocket = null;
        this.proxyReconnectTimer = null;
        this.proxyReconnectAttempts = 0;
        this.maxProxyReconnectAttempts = 5;
        
        this.initElements();
        this.bindEvents();
        this.initProxyWebSocket();
    }

    /**
     * 初始化DOM元素引用
     */
    initElements() {
        console.log('初始化DOM元素...');
        
        // 文件上传相关元素
        this.uploadArea = document.getElementById('uploadArea');
        this.browseBtn = document.getElementById('browseBtn');
        this.fileInput = document.getElementById('fileInput');
        this.fileListSection = document.getElementById('fileListSection');
        this.fileList = document.getElementById('fileList');
        
        // 验证元素是否成功获取
        console.log('元素获取结果:');
        console.log('uploadArea:', this.uploadArea);
        console.log('browseBtn:', this.browseBtn);
        console.log('fileInput:', this.fileInput);
        console.log('fileListSection:', this.fileListSection);
        console.log('fileList:', this.fileList);
        
        // 设置相关元素
        this.settingsSection = document.getElementById('settingsSection');
        this.translationApi = document.getElementById('translationApi');
        this.apiKeyField = document.getElementById('apiKeyField');
        this.apiKey = document.getElementById('apiKey');
        this.sourceLang = document.getElementById('sourceLang');
        this.targetLang = document.getElementById('targetLang');
        this.includeOriginal = document.getElementById('includeOriginal');
        this.translateBtn = document.getElementById('translateBtn');
        
        // 结果相关元素
        this.resultSection = document.getElementById('resultSection');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        this.originalLyrics = document.getElementById('originalLyrics');
        this.translatedLyrics = document.getElementById('translatedLyrics');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.outputFormat = document.getElementById('outputFormat');
        
        // 音频上传相关元素
        this.audioUploadArea = document.getElementById('audioUploadArea');
        this.audioBrowseBtn = document.getElementById('audioBrowseBtn');
        this.audioInput = document.getElementById('audioInput');
        this.audioInfo = document.getElementById('audioInfo');
        this.audioFileName = document.getElementById('audioFileName');
        this.removeAudioBtn = document.getElementById('removeAudioBtn');
        this.generateWordByWordBtn = document.getElementById('generateWordByWordBtn');
        this.currentAudio = null;
        
        // 加载状态
        this.loading = document.getElementById('loading');
        
        // 验证音频元素是否成功获取
        console.log('音频元素获取结果:');
        console.log('audioUploadArea:', this.audioUploadArea);
        console.log('audioBrowseBtn:', this.audioBrowseBtn);
        console.log('audioInput:', this.audioInput);
        
        // 批量功能元素
        this.batchTranslateBtn = document.getElementById('batchTranslateBtn');
        this.batchDownloadBtn = document.getElementById('batchDownloadBtn');
        
        // 控制台相关元素
        this.consoleContainer = document.querySelector('.console-container');
        this.toggleConsoleBtn = document.getElementById('toggleConsole');
        this.clearLogBtn = document.getElementById('clearLog');
        this.consoleLog = document.getElementById('consoleLog');
        this.proxyStatus = document.getElementById('proxyStatus');
        
        // 代理控制按钮
        this.startProxyBtn = document.getElementById('startProxyBtn');
        this.stopProxyBtn = document.getElementById('stopProxyBtn');
        this.restartProxyBtn = document.getElementById('restartProxyBtn');
        
        // 验证控制台元素是否成功获取
        console.log('控制台元素获取结果:');
        console.log('consoleContainer:', this.consoleContainer);
        console.log('toggleConsoleBtn:', this.toggleConsoleBtn);
        console.log('clearLogBtn:', this.clearLogBtn);
        console.log('consoleLog:', this.consoleLog);
        console.log('proxyStatus:', this.proxyStatus);
        console.log('startProxyBtn:', this.startProxyBtn);
        console.log('stopProxyBtn:', this.stopProxyBtn);
        console.log('restartProxyBtn:', this.restartProxyBtn);
        
        // 下载进度元素
        this.downloadProgress = document.getElementById('downloadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // 通知元素
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
        this.notificationClose = document.getElementById('notificationClose');
        
        // 验证新增元素是否成功获取
        console.log('下载和通知元素获取结果:');
        console.log('downloadProgress:', this.downloadProgress);
        console.log('notification:', this.notification);
        
        // 逐字歌词相关元素
        this.currentLine = document.getElementById('currentLine');
        this.nextLine = document.getElementById('nextLine');
        this.playBtn = document.getElementById('playBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.progressSlider = document.getElementById('progressSlider');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.playbackSpeed = document.getElementById('playbackSpeed');
        this.timelineEditor = document.getElementById('timelineEditor');
        this.saveTimelineBtn = document.getElementById('saveTimelineBtn');
        this.resetTimelineBtn = document.getElementById('resetTimelineBtn');
        
        // 音频播放器
        this.audioPlayer = null;
        this.currentAudioIndex = 0;
        this.isPlaying = false;
        this.playbackTime = 0;
        
        // 验证逐字歌词元素是否成功获取
        console.log('逐字歌词元素获取结果:');
        console.log('currentLine:', this.currentLine);
        console.log('playBtn:', this.playBtn);
        console.log('progressSlider:', this.progressSlider);
        
        // 频谱分析相关元素
        this.spectrumCanvas = document.getElementById('spectrumCanvas');
        this.spectrumCtx = this.spectrumCanvas ? this.spectrumCanvas.getContext('2d') : null;
        this.visualizationMode = document.getElementById('visualizationMode');
        this.fftSize = document.getElementById('fftSize');
        this.smoothingTimeConstant = document.getElementById('smoothingTimeConstant');
        this.smoothingValue = document.getElementById('smoothingValue');
        this.toggleSpectrum = document.getElementById('toggleSpectrum');
        this.saveSpectrum = document.getElementById('saveSpectrum');
        this.clearSpectrum = document.getElementById('clearSpectrum');
        
        // 频谱信息显示元素
        this.peakFrequency = document.getElementById('peakFrequency');
        this.peakEnergy = document.getElementById('peakEnergy');
        this.averageEnergy = document.getElementById('averageEnergy');
        
        // 频谱分析状态
        this.isSpectrumVisible = true;
        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = 0;
        this.spectrumAnimationId = null;
        this.waterfallData = [];
        this.waterfallIndex = 0;
        this.fftSizeValue = 512;
        this.smoothingValueValue = 0.8;
        this.visualizationModeValue = 'bars';
        
        // 验证频谱元素是否成功获取
        console.log('频谱元素获取结果:');
        console.log('spectrumCanvas:', this.spectrumCanvas);
        console.log('visualizationMode:', this.visualizationMode);
        console.log('fftSize:', this.fftSize);
        console.log('smoothingTimeConstant:', this.smoothingTimeConstant);
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        console.log('绑定事件监听器...');
        
        // 文件上传事件
        if (this.browseBtn) {
            this.browseBtn.addEventListener('click', () => {
                console.log('浏览按钮点击');
                this.log('info', '浏览按钮点击');
                this.fileInput.click();
            });
            console.log('浏览按钮事件绑定成功');
        } else {
            console.error('浏览按钮元素未找到');
        }
        
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                console.log('文件选择事件触发');
                this.log('info', '文件选择事件触发');
                this.handleFileSelect(e);
            });
            console.log('文件输入事件绑定成功');
        } else {
            console.error('文件输入元素未找到');
        }
        
        // 拖放事件
        if (this.uploadArea) {
            // 添加 dragenter 事件监听器
            this.uploadArea.addEventListener('dragenter', (e) => {
                console.log('拖放进入事件触发');
                this.log('info', '拖放进入事件触发');
                this.handleDragEnter(e);
            });
            
            this.uploadArea.addEventListener('dragover', (e) => {
                console.log('拖放悬停事件触发');
                this.log('info', '拖放悬停事件触发');
                this.handleDragOver(e);
            });
            
            this.uploadArea.addEventListener('dragleave', (e) => {
                console.log('拖放离开事件触发');
                this.log('info', '拖放离开事件触发');
                this.handleDragLeave(e);
            });
            
            this.uploadArea.addEventListener('drop', (e) => {
                console.log('拖放放下事件触发');
                this.log('info', '拖放放下事件触发');
                this.handleDrop(e);
            });
            console.log('拖放事件绑定成功');
        } else {
            console.error('上传区域元素未找到');
        }
        
        // 为整个文档添加事件监听器，防止浏览器默认行为
        document.addEventListener('dragenter', (e) => {
            console.log('文档拖放进入事件触发');
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('dragover', (e) => {
            console.log('文档拖放悬停事件触发');
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('dragleave', (e) => {
            console.log('文档拖放离开事件触发');
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('drop', (e) => {
            console.log('文档拖放放下事件触发');
            e.preventDefault();
            e.stopPropagation();
        });
        
        // 翻译设置事件
        if (this.translationApi) {
            this.translationApi.addEventListener('change', (e) => {
                console.log('翻译API选择事件触发');
                this.log('info', '翻译API选择事件触发');
                this.handleTranslationApiChange(e);
            });
            console.log('翻译API选择事件绑定成功');
        } else {
            console.error('翻译API选择元素未找到');
        }
        
        // 翻译按钮事件
        if (this.translateBtn) {
            this.translateBtn.addEventListener('click', () => {
                console.log('翻译按钮点击');
                this.log('info', '翻译按钮点击');
                this.translateLyrics();
            });
            console.log('翻译按钮事件绑定成功');
        } else {
            console.error('翻译按钮元素未找到');
        }
        
        // 音频上传事件
        if (this.audioBrowseBtn) {
            this.audioBrowseBtn.addEventListener('click', () => {
                console.log('音频浏览按钮点击');
                this.log('info', '音频浏览按钮点击');
                this.audioInput.click();
            });
            console.log('音频浏览按钮事件绑定成功');
        } else {
            console.error('音频浏览按钮元素未找到');
        }
        
        if (this.audioInput) {
            this.audioInput.addEventListener('change', (e) => {
                console.log('音频文件选择事件触发');
                this.log('info', '音频文件选择事件触发');
                this.handleAudioSelect(e);
            });
            console.log('音频输入事件绑定成功');
        } else {
            console.error('音频输入元素未找到');
        }
        
        if (this.removeAudioBtn) {
            this.removeAudioBtn.addEventListener('click', () => {
                console.log('移除音频按钮点击');
                this.log('info', '移除音频按钮点击');
                this.removeAudio();
            });
            console.log('移除音频按钮事件绑定成功');
        } else {
            console.error('移除音频按钮元素未找到');
        }
        
        if (this.generateWordByWordBtn) {
            this.generateWordByWordBtn.addEventListener('click', () => {
                console.log('生成逐字歌词按钮点击');
                this.log('info', '生成逐字歌词按钮点击');
                this.generateWordByWordLyrics();
            });
            console.log('生成逐字歌词按钮事件绑定成功');
        } else {
            console.error('生成逐字歌词按钮元素未找到');
        }
        
        // 音频拖放事件
        if (this.audioUploadArea) {
            this.audioUploadArea.addEventListener('dragenter', (e) => {
                console.log('音频拖放进入事件触发');
                this.log('info', '音频拖放进入事件触发');
                e.preventDefault();
                e.stopPropagation();
                this.audioUploadArea.classList.add('dragover');
            });
            
            this.audioUploadArea.addEventListener('dragover', (e) => {
                console.log('音频拖放悬停事件触发');
                this.log('info', '音频拖放悬停事件触发');
                e.preventDefault();
                e.stopPropagation();
                this.audioUploadArea.classList.add('dragover');
            });
            
            this.audioUploadArea.addEventListener('dragleave', (e) => {
                console.log('音频拖放离开事件触发');
                this.log('info', '音频拖放离开事件触发');
                e.preventDefault();
                e.stopPropagation();
                this.audioUploadArea.classList.remove('dragover');
            });
            
            this.audioUploadArea.addEventListener('drop', (e) => {
                console.log('音频拖放放下事件触发');
                this.log('info', '音频拖放放下事件触发');
                e.preventDefault();
                e.stopPropagation();
                this.audioUploadArea.classList.remove('dragover');
                this.handleAudioDrop(e);
            });
            console.log('音频拖放事件绑定成功');
        } else {
            console.error('音频上传区域元素未找到');
        }
        
        // 标签切换事件
        if (this.tabBtns) {
            this.tabBtns.forEach((btn, index) => {
                btn.addEventListener('click', (e) => {
                    console.log('标签切换事件触发，标签索引:', index);
                    this.log('info', `标签切换事件触发，标签索引: ${index}`);
                    this.switchTab(e);
                });
            });
            console.log('标签切换事件绑定成功');
        } else {
            console.error('标签按钮元素未找到');
        }
        
        // 下载按钮事件
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => {
                console.log('下载按钮点击');
                this.log('info', '下载按钮点击');
                this.downloadTranslatedLyrics();
            });
            console.log('下载按钮事件绑定成功');
        } else {
            console.error('下载按钮元素未找到');
        }
        
        // 批量功能事件
        this.bindBatchEvents();
        
        // 控制台事件
        if (this.toggleConsoleBtn) {
            this.toggleConsoleBtn.addEventListener('click', () => {
                this.toggleConsole();
            });
            console.log('控制台切换事件绑定成功');
        }
        
        if (this.clearLogBtn) {
            this.clearLogBtn.addEventListener('click', () => {
                this.clearLog();
            });
            console.log('清空日志事件绑定成功');
        }
        
        // 代理控制按钮事件
        if (this.startProxyBtn) {
            this.startProxyBtn.addEventListener('click', () => {
                this.requestProxyStart();
            });
            console.log('启动代理按钮事件绑定成功');
        }
        
        if (this.stopProxyBtn) {
            this.stopProxyBtn.addEventListener('click', () => {
                this.requestProxyStop();
            });
            console.log('停止代理按钮事件绑定成功');
        }
        
        if (this.restartProxyBtn) {
            this.restartProxyBtn.addEventListener('click', () => {
                this.requestProxyRestart();
            });
            console.log('重启代理按钮事件绑定成功');
        }
        
        // 通知关闭事件
        if (this.notificationClose) {
            this.notificationClose.addEventListener('click', () => {
                this.hideNotification();
            });
        }
        
        // 逐字歌词事件
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => {
                this.playAudio();
            });
            console.log('播放按钮事件绑定成功');
        }
        
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => {
                this.pauseAudio();
            });
            console.log('暂停按钮事件绑定成功');
        }
        
        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => {
                this.stopAudio();
            });
            console.log('停止按钮事件绑定成功');
        }
        
        if (this.progressSlider) {
            this.progressSlider.addEventListener('input', (e) => {
                this.seekAudio(e.target.value);
            });
            console.log('进度条事件绑定成功');
        }
        
        if (this.playbackSpeed) {
            this.playbackSpeed.addEventListener('change', (e) => {
                this.setPlaybackSpeed(e.target.value);
            });
            console.log('播放速度事件绑定成功');
        }
        
        if (this.saveTimelineBtn) {
            this.saveTimelineBtn.addEventListener('click', () => {
                this.saveTimeline();
            });
            console.log('保存时间轴事件绑定成功');
        }
        
        if (this.resetTimelineBtn) {
            this.resetTimelineBtn.addEventListener('click', () => {
                this.resetTimeline();
            });
            console.log('重置时间轴事件绑定成功');
        }
        
        // 频谱分析事件
        if (this.visualizationMode) {
            this.visualizationMode.addEventListener('change', (e) => {
                this.visualizationModeValue = e.target.value;
                this.log('info', `切换可视化模式: ${this.visualizationModeValue}`);
                this.updateSpectrumDisplay();
            });
            console.log('可视化模式切换事件绑定成功');
        }
        
        if (this.fftSize) {
            this.fftSize.addEventListener('change', (e) => {
                this.fftSizeValue = parseInt(e.target.value);
                this.log('info', `设置FFT大小: ${this.fftSizeValue}`);
                this.updateAnalyserSettings();
            });
            console.log('FFT大小调整事件绑定成功');
        }
        
        if (this.smoothingTimeConstant) {
            this.smoothingTimeConstant.addEventListener('input', (e) => {
                this.smoothingValueValue = parseFloat(e.target.value);
                this.smoothingValue.textContent = this.smoothingValueValue;
                this.log('info', `设置平滑系数: ${this.smoothingValueValue}`);
                this.updateAnalyserSettings();
            });
            console.log('平滑系数调整事件绑定成功');
        }
        
        if (this.toggleSpectrum) {
            this.toggleSpectrum.addEventListener('click', () => {
                this.isSpectrumVisible = !this.isSpectrumVisible;
                this.toggleSpectrum.textContent = this.isSpectrumVisible ? '隐藏频谱' : '显示频谱';
                this.spectrumCanvas.style.display = this.isSpectrumVisible ? 'block' : 'none';
                this.log('info', `频谱${this.isSpectrumVisible ? '显示' : '隐藏'}`);
            });
            console.log('频谱显示切换事件绑定成功');
        }
        
        if (this.saveSpectrum) {
            this.saveSpectrum.addEventListener('click', () => {
                this.saveSpectrumSnapshot();
            });
            console.log('保存频谱快照事件绑定成功');
        }
        
        if (this.clearSpectrum) {
            this.clearSpectrum.addEventListener('click', () => {
                this.clearSpectrumData();
            });
            console.log('清空频谱数据事件绑定成功');
        }
        
        // 初始化控制台和代理检测
        this.initConsole();
        this.checkProxyStatus();
    }
    

    
    /**
     * 初始化控制台
     */
    initConsole() {
        this.log('info', '控制台初始化完成');
        this.log('info', `歌词翻译工具启动，版本: ${this.version}`);
    }
    
    /**
     * 切换控制台显示/隐藏
     */
    toggleConsole() {
        if (!this.consoleContainer) return;
        
        this.consoleContainer.classList.toggle('collapsed');
        const isCollapsed = this.consoleContainer.classList.contains('collapsed');
        this.toggleConsoleBtn.textContent = isCollapsed ? '展开' : '收起';
        
        this.log('info', `控制台${isCollapsed ? '收起' : '展开'}`);
    }
    
    /**
     * 清空控制台日志
     */
    clearLog() {
        if (!this.consoleLog) return;
        this.consoleLog.innerHTML = '';
        this.log('info', '日志已清空');
    }
    
    /**
     * 记录日志到控制台
     * @param {string} type - 日志类型：info, success, error, warning
     * @param {string} message - 日志消息
     */
    log(type, message) {
        if (!this.consoleLog) return;
        
        // 获取当前时间
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN');
        
        // 创建日志元素
        const logDiv = document.createElement('div');
        logDiv.className = `log-${type}`;
        logDiv.innerHTML = `<span class="log-time">${timeStr}</span>${message}`;
        
        // 添加到控制台
        this.consoleLog.appendChild(logDiv);
        
        // 滚动到底部
        this.consoleLog.scrollTop = this.consoleLog.scrollHeight;
    }
    
    /**
     * 检查代理服务器状态
     */
    async checkProxyStatus() {
        // 使用新的HTTP API检查方法替代旧方法
        this.checkProxyStatusHttp();
    }
    
    /**
     * 初始化代理WebSocket连接
     */
    initProxyWebSocket() {
        this.connectProxyWebSocket();
    }
    
    /**
     * 建立代理WebSocket连接
     */
    connectProxyWebSocket() {
        // 简化WebSocket连接逻辑，减少不必要的重连尝试
        // 只在开发环境或本地代理运行时才尝试连接
        try {
            // 关闭现有连接
            if (this.proxyWebSocket) {
                this.proxyWebSocket.close();
            }
            
            // 仅在本地环境尝试连接WebSocket
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (!isLocalhost) {
                this.log('info', '非本地环境，跳过WebSocket连接');
                return;
            }
            
            // 创建新的WebSocket连接
            const wsUrl = 'ws://localhost:3002';
            this.proxyWebSocket = new WebSocket(wsUrl);
            
            // 设置连接超时
            const timeoutId = setTimeout(() => {
                if (this.proxyWebSocket.readyState === WebSocket.CONNECTING) {
                    this.log('warning', 'WebSocket连接超时，放弃连接');
                    this.proxyWebSocket.close();
                }
            }, 3000);
            
            // 绑定事件监听器
            this.proxyWebSocket.onopen = () => {
                clearTimeout(timeoutId);
                this.log('success', '代理WebSocket连接已建立');
                this.proxyReconnectAttempts = 0;
                this.requestProxyStatus();
            };
            
            this.proxyWebSocket.onmessage = (event) => {
                this.onProxyWebSocketMessage(event);
            };
            
            this.proxyWebSocket.onclose = () => {
                clearTimeout(timeoutId);
                this.onProxyWebSocketClose();
            };
            
            this.proxyWebSocket.onerror = (error) => {
                clearTimeout(timeoutId);
                this.onProxyWebSocketError(error);
            };
            
        } catch (error) {
            this.log('error', `代理WebSocket连接失败: ${error.message}`);
            this.reconnectProxyWebSocket();
        }
    }
    
    /**
     * 处理代理WebSocket消息
     * @param {Event} event - WebSocket消息事件
     */
    onProxyWebSocketMessage(event) {
        try {
            const data = JSON.parse(event.data);
            this.updateProxyStatusDisplay(data.status);
            
            // 如果代理状态是error，尝试启动代理
            if (data.status === 'error' || data.status === 'stopped') {
                this.requestProxyStart();
            }
        } catch (error) {
            this.log('error', `解析代理WebSocket消息失败: ${error.message}`);
        }
    }
    
    /**
     * 处理代理WebSocket关闭
     */
    onProxyWebSocketClose() {
        this.log('warning', '代理WebSocket连接已关闭');
        this.updateProxyStatusDisplay('unknown');
        this.reconnectProxyWebSocket();
    }
    
    /**
     * 处理代理WebSocket错误
     * @param {Event} error - WebSocket错误事件
     */
    onProxyWebSocketError(error) {
        this.log('error', `代理WebSocket错误: ${error.message}`);
    }
    
    /**
     * 重新连接代理WebSocket
     */
    reconnectProxyWebSocket() {
        // 清除现有定时器
        if (this.proxyReconnectTimer) {
            clearTimeout(this.proxyReconnectTimer);
        }
        
        // 检查重连尝试次数，减少最大尝试次数
        if (this.proxyReconnectAttempts >= 3) { // 最多尝试3次
            this.log('info', '达到最大重连尝试次数，停止尝试连接代理WebSocket');
            // 尝试直接调用HTTP API检查代理状态
            this.checkProxyStatusHttp();
            return;
        }
        
        // 计算重连延迟（更长的初始延迟，减少频率）
        const delay = Math.min(2000 * Math.pow(2, this.proxyReconnectAttempts), 8000);
        this.proxyReconnectAttempts++;
        
        // 仅在本地环境尝试重连
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocalhost) {
            this.log('info', '非本地环境，跳过WebSocket重连');
            return;
        }
        
        this.log('info', `尝试重新连接代理WebSocket，尝试次数: ${this.proxyReconnectAttempts}，延迟: ${delay}ms`);
        
        this.proxyReconnectTimer = setTimeout(() => {
            this.connectProxyWebSocket();
        }, delay);
    }
    
    /**
     * 更新代理状态显示
     * @param {string} status - 代理状态：stopped, starting, running, error, unknown
     */
    updateProxyStatusDisplay(status) {
        const statusElement = document.getElementById('proxyStatus');
        if (!statusElement) return;
        
        this.proxyStatus = status;
        let statusText = '代理状态：未知';
        let statusClass = 'status-indicator unknown';
        
        switch (status) {
            case 'running':
                statusText = '代理状态：在线';
                statusClass = 'status-indicator online';
                this.log('success', '代理服务器在线，可以正常使用翻译功能');
                break;
            case 'starting':
                statusText = '代理状态：启动中...';
                statusClass = 'status-indicator starting';
                this.log('info', '代理服务器正在启动');
                break;
            case 'stopped':
                statusText = '代理状态：离线';
                statusClass = 'status-indicator offline';
                this.log('warning', '代理服务器已停止');
                break;
            case 'error':
                statusText = '代理状态：错误';
                statusClass = 'status-indicator error';
                this.log('error', '代理服务器出现错误');
                break;
            default:
                statusText = '代理状态：未知';
                statusClass = 'status-indicator unknown';
                this.log('warning', '代理服务器状态未知');
        }
        
        statusElement.textContent = statusText;
        statusElement.className = statusClass;
    }
    
    /**
     * 请求代理状态
     */
    requestProxyStatus() {
        if (this.proxyWebSocket && this.proxyWebSocket.readyState === WebSocket.OPEN) {
            this.proxyWebSocket.send(JSON.stringify({ action: 'status' }));
        }
    }
    
    /**
     * 请求启动代理服务器
     */
    requestProxyStart() {
        if (this.proxyWebSocket && this.proxyWebSocket.readyState === WebSocket.OPEN) {
            this.log('info', '请求启动代理服务器');
            this.proxyWebSocket.send(JSON.stringify({ action: 'start' }));
        } else {
            // 如果WebSocket不可用，尝试使用HTTP API
            this.startProxyHttp();
        }
    }
    
    /**
     * 请求重启代理服务器
     */
    requestProxyRestart() {
        if (this.proxyWebSocket && this.proxyWebSocket.readyState === WebSocket.OPEN) {
            this.log('info', '请求重启代理服务器');
            this.proxyWebSocket.send(JSON.stringify({ action: 'restart' }));
        } else {
            // 如果WebSocket不可用，尝试使用HTTP API
            this.restartProxyHttp();
        }
    }
    
    /**
     * 请求停止代理服务器
     */
    requestProxyStop() {
        if (this.proxyWebSocket && this.proxyWebSocket.readyState === WebSocket.OPEN) {
            this.log('info', '请求停止代理服务器');
            this.proxyWebSocket.send(JSON.stringify({ action: 'stop' }));
        } else {
            // 如果WebSocket不可用，尝试使用HTTP API
            this.stopProxyHttp();
        }
    }
    
    /**
     * 使用HTTP API停止代理服务器
     */
    async stopProxyHttp() {
        try {
            this.log('info', '尝试使用HTTP API停止代理服务器');
            const response = await fetch('http://localhost:3003/api/proxy/stop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.log('success', '代理服务器停止请求已发送');
                // 重新检查状态
                setTimeout(() => {
                    this.checkProxyStatusHttp();
                }, 1000);
            } else {
                const errorData = await response.json();
                this.log('error', `停止代理服务器失败: ${errorData.error}`);
            }
        } catch (error) {
            this.log('error', `使用HTTP API停止代理服务器失败: ${error.message}`);
        }
    }
    
    /**
 * 使用HTTP API检查代理状态（WebSocket不可用时的备选方案）
 */
async checkProxyStatusHttp() {
    const statusElement = document.getElementById('proxyStatus');
    if (!statusElement) return;
    
    // 检查状态缓存，避免频繁检测
    if (this.proxyStatusCache && Date.now() - this.proxyStatusCache.timestamp < 30000) {
        this.log('info', '使用缓存的代理服务器状态');
        this.updateProxyStatusDisplay(this.proxyStatusCache.status);
        return;
    }
    
    statusElement.textContent = '代理状态：检查中...';
    statusElement.className = 'status-indicator checking';
    this.log('info', '开始使用HTTP API检查代理服务器状态');
    
    // 尝试不同的路径和方法进行检查，调整优先级
    const checkUrls = [
        { url: 'http://localhost:3001/ping', method: 'GET', priority: 'high' },
        { url: 'http://localhost:3001/status', method: 'GET', priority: 'high' },
        { url: 'http://localhost:3001/health', method: 'GET', priority: 'high' },
        { url: 'http://localhost:3001/api/health', method: 'GET', priority: 'high' },
        { url: 'http://localhost:3001/translate', method: 'OPTIONS', priority: 'medium' },
        { url: 'http://localhost:3001', method: 'HEAD', priority: 'low' },
        { url: 'http://localhost:3003/api/proxy/status', method: 'GET', priority: 'medium' }
    ];
    
    let isRunning = false;
    let lastError = null;
    let checkResults = [];
    
    // 尝试所有检查URL
    for (const checkConfig of checkUrls) {
        try {
            // 使用 AbortController 实现超时，根据优先级调整超时时间
            const timeout = checkConfig.priority === 'high' ? 2000 : checkConfig.priority === 'medium' ? 3000 : 5000;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            // 检查代理服务器
            const response = await fetch(checkConfig.url, {
                method: checkConfig.method,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            // 只要服务器返回2xx或3xx状态码，就认为代理正在运行
            if (response.status >= 200 && response.status < 500) {
                isRunning = true;
                this.log('success', `代理服务器检测成功: ${checkConfig.url} (状态码: ${response.status})`);
                checkResults.push({ url: checkConfig.url, status: 'success', code: response.status });
                break;
            } else {
                const errorMsg = `代理服务器响应错误: ${response.status}`;
                lastError = new Error(errorMsg);
                this.log('debug', `${checkConfig.url} 响应状态: ${response.status}`);
                checkResults.push({ url: checkConfig.url, status: 'error', code: response.status });
            }
        } catch (error) {
            const errorMsg = error.name === 'AbortError' ? '请求超时' : error.message;
            this.log('debug', `${checkConfig.url} 检查失败: ${errorMsg}`);
            lastError = error;
            checkResults.push({ url: checkConfig.url, status: 'failed', error: errorMsg });
        }
    }
    
    // 记录检查结果
    this.log('debug', `代理服务器检查结果: ${JSON.stringify(checkResults)}`);
    
    // 更新状态显示和缓存
    if (isRunning) {
        this.updateProxyStatusDisplay('running');
        // 缓存成功状态，有效期30秒
        this.proxyStatusCache = {
            status: 'running',
            timestamp: Date.now()
        };
    } else {
        this.updateProxyStatusDisplay('stopped');
        // 缓存失败状态，有效期10秒
        this.proxyStatusCache = {
            status: 'stopped',
            timestamp: Date.now()
        };
        
        if (lastError) {
            if (lastError.name === 'AbortError') {
                this.log('warning', '代理服务器检测超时，可能离线或网络连接问题');
            } else {
                this.log('error', `代理服务器检测失败: ${lastError.message}`);
            }
        } else {
            this.log('error', '代理服务器检测失败: 未知错误');
        }
        
        // 尝试启动代理，但增加延迟，避免频繁启动
        if (!this.isProxyStartAttempted || Date.now() - this.isProxyStartAttempted > 15000) {
            this.isProxyStartAttempted = Date.now();
            setTimeout(() => {
                this.startProxyHttp();
            }, 1000);
        }
    }
}
    
    /**
     * 使用HTTP API启动代理服务器
     */
    async startProxyHttp() {
        try {
            this.log('info', '尝试使用HTTP API启动代理服务器');
            
            // 先检查是否已经在运行，避免重复启动
            const isAlreadyRunning = await this.checkProxyRunningSimple();
            if (isAlreadyRunning) {
                this.log('success', '代理服务器已经在运行，无需再次启动');
                this.updateProxyStatusDisplay('running');
                return;
            }
            
            // 尝试不同的启动端点
            const startUrls = [
                { url: 'http://localhost:3003/api/proxy/start', method: 'POST', priority: 'high' },
                { url: 'http://localhost:3003/api/proxy/restart', method: 'POST', priority: 'medium' }
            ];
            
            let startSuccess = false;
            let lastStartError = null;
            let startResults = [];
            
            for (const startConfig of startUrls) {
                try {
                    // 使用 AbortController 实现超时
                    const controller = new AbortController();
                    const timeout = 5000;
                    const timeoutId = setTimeout(() => controller.abort(), timeout);
                    
                    this.log('info', `尝试使用 ${startConfig.url} 启动代理服务器`);
                    
                    const response = await fetch(startConfig.url, {
                        method: startConfig.method,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (response.ok) {
                        const responseData = await response.json().catch(() => ({}));
                        this.log('success', `代理服务器启动请求已发送到 ${startConfig.url}，响应: ${JSON.stringify(responseData)}`);
                        startSuccess = true;
                        startResults.push({ url: startConfig.url, status: 'success', data: responseData });
                        // 延迟检查状态，给代理服务器足够的启动时间
                        setTimeout(() => {
                            this.checkProxyStatusHttp();
                        }, 3000);
                        break;
                    } else {
                        const errorData = await response.json().catch(async () => ({
                            error: await response.text() || `HTTP ${response.status}`
                        }));
                        this.log('debug', `启动请求失败: ${startConfig.url} - ${errorData.error}`);
                        lastStartError = errorData.error;
                        startResults.push({ url: startConfig.url, status: 'error', error: errorData.error });
                    }
                } catch (error) {
                    const errorMsg = error.name === 'AbortError' ? '请求超时' : error.message;
                    this.log('debug', `启动请求异常: ${startConfig.url} - ${errorMsg}`);
                    lastStartError = errorMsg;
                    startResults.push({ url: startConfig.url, status: 'failed', error: errorMsg });
                }
            }
            
            // 记录启动结果
            this.log('debug', `代理服务器启动结果: ${JSON.stringify(startResults)}`);
            
            if (!startSuccess) {
                this.log('error', `所有启动端点都失败，最后一个错误: ${lastStartError}`);
                
                // 检查是否是因为代理管理器未运行（3003端口不可达）
                const isManagerRunning = await this.checkPortAccessible('http://localhost:3003');
                if (!isManagerRunning) {
                    this.log('warning', '代理管理器未运行，尝试直接检查代理服务器是否在运行');
                    // 直接检查代理服务器是否在运行（可能是手动启动的）
                    setTimeout(() => {
                        this.checkProxyStatusHttp();
                    }, 1000);
                }
                
                // 提供用户指导
                this.provideProxyStartupGuidance();
            }
        } catch (error) {
            const errorMsg = error.name === 'AbortError' ? '启动代理服务器超时' : `启动代理服务器失败: ${error.message}`;
            this.log('error', errorMsg);
            
            // 提供用户指导
            this.provideProxyStartupGuidance();
            
            // 最后再检查一次状态
            setTimeout(() => {
                this.checkProxyStatusHttp();
            }, 1000);
        }
    }
    
    /**
     * 简单检查代理是否在运行，用于避免重复启动
     */
    async checkProxyRunningSimple() {
        try {
            const response = await fetch('http://localhost:3001/ping', {
                method: 'GET',
                timeout: 1000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 检查端口是否可达
     */
    async checkPortAccessible(url) {
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                timeout: 1000
            });
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 提供代理启动指导
     */
    provideProxyStartupGuidance() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.log('info', '--- 代理服务器启动指导 ---');
            this.log('info', '1. 直接启动代理服务器: npm run start:proxy');
            this.log('info', '2. 启动代理管理器: npm run start');
            this.log('info', '3. 手动运行代理: node proxy.js');
            this.log('info', '请确保在项目根目录下执行上述命令');
            this.log('info', '----------------------------');
        } else {
            this.log('error', '非本地环境下无法自动启动代理服务器，请联系管理员');
        }
    }
    
    /**
     * 使用HTTP API重启代理服务器
     */
    async restartProxyHttp() {
        try {
            this.log('info', '尝试使用HTTP API重启代理服务器');
            
            // 先检查是否在运行
            const isRunning = await this.checkProxyRunningSimple();
            if (!isRunning) {
                this.log('info', '代理服务器未运行，将尝试启动而不是重启');
                this.startProxyHttp();
                return;
            }
            
            // 使用 AbortController 实现超时
            const controller = new AbortController();
            const timeout = 5000;
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch('http://localhost:3003/api/proxy/restart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const responseData = await response.json().catch(() => ({}));
                this.log('success', `代理服务器重启请求已发送，响应: ${JSON.stringify(responseData)}`);
                // 重新检查状态，给代理服务器足够的重启时间
                setTimeout(() => {
                    this.checkProxyStatusHttp();
                }, 4000);
            } else {
                const errorData = await response.json().catch(async () => ({
                    error: await response.text() || `HTTP ${response.status}`
                }));
                this.log('error', `重启代理服务器失败: ${errorData.error}`);
                
                // 检查代理管理器是否还在运行
                const isManagerRunning = await this.checkPortAccessible('http://localhost:3003');
                if (!isManagerRunning) {
                    this.log('warning', '代理管理器未运行，尝试直接启动代理服务器');
                    this.startProxyHttp();
                }
            }
        } catch (error) {
            const errorMsg = error.name === 'AbortError' ? '重启代理服务器超时' : `重启代理服务器失败: ${error.message}`;
            this.log('error', errorMsg);
            
            // 尝试直接启动代理服务器
            this.log('info', '重启失败，尝试直接启动代理服务器');
            this.startProxyHttp();
        }
    }
    

    
    /**
     * 绑定批量功能事件监听器
     */
    bindBatchEvents() {
        // 批量翻译按钮事件
        if (this.batchTranslateBtn) {
            this.batchTranslateBtn.addEventListener('click', () => {
                console.log('批量翻译按钮点击');
                this.handleBatchTranslate();
            });
            console.log('批量翻译按钮事件绑定成功');
        }
        
        // 批量下载按钮事件
        if (this.batchDownloadBtn) {
            this.batchDownloadBtn.addEventListener('click', () => {
                console.log('批量下载按钮点击');
                this.handleBatchDownload();
            });
            console.log('批量下载按钮事件绑定成功');
        }
    }
    
    /**
     * 处理翻译API选择变化（仅支持百度翻译，此方法保留为兼容原有代码）
     */
    handleTranslationApiChange(e) {
        // 仅支持百度翻译，忽略其他服务
        console.warn('仅支持百度翻译服务，此调用已忽略');
    }

    /**
     * 处理文件选择
     * @param {Event} e - 文件选择事件
     */
    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
    }

    /**
     * 处理拖放事件 - 进入
     * @param {Event} e - 拖放事件
     */
    handleDragEnter(e) {
        console.log('拖放进入事件触发');
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.add('dragover');
    }

    /**
     * 处理拖放事件 - 悬停
     * @param {Event} e - 拖放事件
     */
    handleDragOver(e) {
        console.log('拖放悬停事件触发');
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.add('dragover');
    }

    /**
     * 处理拖放事件 - 离开
     * @param {Event} e - 拖放事件
     */
    handleDragLeave(e) {
        console.log('拖放离开事件触发');
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('dragover');
    }

    /**
     * 处理拖放事件 - 放下
     * @param {Event} e - 拖放事件
     */
    handleDrop(e) {
        console.log('拖放放下事件触发');
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('dragover');
        
        console.log('拖放的文件:', e.dataTransfer.files);
        const files = Array.from(e.dataTransfer.files);
        console.log('处理文件:', files);
        this.addFiles(files);
    }

    /**
     * 添加文件到上传列表
     * @param {Array<File>} files - 文件数组
     */
    addFiles(files) {
        // 过滤支持的文件类型
        const supportedExtensions = ['.lrc', '.srt', '.ass', '.ssa', '.txt'];
        const validFiles = files.filter(file => {
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            return supportedExtensions.includes(ext);
        });
        
        // 重置翻译数据，避免残留上一次的翻译结果
        this.resetTranslationData();
        
        this.uploadedFiles = [...this.uploadedFiles, ...validFiles];
        this.renderFileList();
        this.showSettings();
    }
    
    /**
     * 重置翻译数据，避免残留上一次的翻译结果
     */
    resetTranslationData() {
        // 重置翻译数据
        this.parsedData = null;
        this.parser = null;
        
        // 清空UI元素
        if (this.originalLyrics) {
            this.originalLyrics.textContent = '';
        }
        if (this.translatedLyrics) {
            this.translatedLyrics.textContent = '';
        }
        
        // 隐藏结果区域
        if (this.resultSection) {
            this.resultSection.style.display = 'none';
        }
        
        console.log('翻译数据已重置');
    }

    /**
     * 渲染文件列表
     */
    renderFileList() {
        this.fileList.innerHTML = '';
        
        this.uploadedFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="file-info">
                    <span class="file-icon">📄</span>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${FileUtils.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="remove-file" onclick="app.removeFile(${index})">×</button>
            `;
            this.fileList.appendChild(li);
        });
        
        this.fileListSection.style.display = this.uploadedFiles.length > 0 ? 'block' : 'none';
    }

    /**
     * 移除文件
     * @param {number} index - 文件索引
     */
    removeFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.renderFileList();
        
        if (this.uploadedFiles.length === 0) {
            this.hideSettings();
        }
    }
    
    /**
     * 处理音频文件选择
     * @param {Event} e - 文件选择事件
     */
    handleAudioSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            this.handleAudioFile(files[0]);
        }
    }
    
    /**
     * 处理音频拖放
     * @param {Event} e - 拖放事件
     */
    handleAudioDrop(e) {
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            this.handleAudioFile(files[0]);
        }
    }
    
    /**
     * 处理音频文件
     * @param {File} file - 音频文件
     */
    handleAudioFile(file) {
        // 检查文件类型
        const supportedTypes = ['.mp3', '.wav', '.ogg', '.flac', '.ala', '.caac', '.dd', '.aac', '.m4a', '.wma', '.aiff', '.ape'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!supportedTypes.includes(ext)) {
            alert('不支持的音频格式，请上传 MP3、WAV、OGG、FLAC、ALA、CAAC、DD 或其他支持的音频格式');
            return;
        }
        
        // 保存音频文件
        this.currentAudio = file;
        
        // 更新UI
        this.audioFileName.textContent = file.name;
        this.audioInfo.style.display = 'block';
        
        console.log('音频文件已上传:', file.name);
    }
    
    /**
     * 移除音频文件
     */
    removeAudio() {
        this.currentAudio = null;
        this.audioInfo.style.display = 'none';
        this.audioFileName.textContent = '';
        this.audioInput.value = '';
        
        console.log('音频文件已移除');
    }
    
    /**
     * 生成逐字歌词
     */
    async generateWordByWordLyrics() {
        // 检查歌词文件是否上传
        if (this.uploadedFiles.length === 0 || !this.currentAudio) {
            alert('请先上传歌词文件和音频文件');
            return;
        }
        
        this.showLoading();
        
        try {
            // 如果parsedData不存在，先解析歌词文件
            if (!this.parsedData) {
                // 处理当前文件
                const file = this.uploadedFiles[this.currentFileIndex];
                const text = await FileUtils.readFile(file);
                
                // 解析文件
                const parseResult = this.parserManager.parse(text);
                this.parsedData = parseResult.data;
                this.parser = parseResult.parser;
            }
            
            // 这里实现逐字歌词生成逻辑
            // 1. 提取歌词文本
            // 2. 分析音频，生成逐字时间戳
            // 3. 生成逐字歌词
            
            // 使用基于Web Audio API的音频分析生成逐字时间戳
            await this.generateRealWordByWordLyrics();
            
            // 显示结果
            const originalText = this.uploadedFiles[this.currentFileIndex] ? 
                this.uploadedFiles[this.currentFileIndex].name : '未知文件';
            this.showResults(originalText);
        } catch (error) {
            console.error('生成逐字歌词失败:', error);
            alert(`生成逐字歌词失败: ${error.message}\n请检查文件格式或重试`);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * 使用Web Audio API生成真实逐字歌词
     */
    async generateRealWordByWordLyrics() {
        if (!this.parsedData.lyricLines) {
            throw new Error('无法生成逐字歌词：未解析到歌词行');
        }
        
        // 检查浏览器是否支持Web Audio API
        if (!window.AudioContext && !window.webkitAudioContext) {
            throw new Error('无法生成逐字歌词：浏览器不支持Web Audio API');
        }
        
        try {
            // 创建音频上下文
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 读取音频文件
            const audioData = await this.readAudioFile(this.currentAudio);
            
            // 解码音频数据
            const audioBuffer = await audioContext.decodeAudioData(audioData);
            
            // 提取音频频谱数据
            const audioFeatures = this.extractAudioFeatures(audioBuffer);
            
            // 生成逐字时间戳
            this.generateWordTimestamps(audioFeatures);
            
            // 优化时间轴精度
            if (this.timelineManager) {
                this.parsedData = this.timelineManager.optimizeTimelineAccuracy(this.parsedData);
            }
            
            console.log('真实逐字歌词生成完成');
        } catch (error) {
            console.error('音频处理失败:', error);
            // 如果音频处理失败，使用备用的均匀分配算法
            this.generateFallbackWordTimestamps();
            
            // 优化时间轴精度
            if (this.timelineManager) {
                this.parsedData = this.timelineManager.optimizeTimelineAccuracy(this.parsedData);
            }
            
            console.log('已使用备用算法生成逐字歌词');
        }
    }
    
    /**
     * 初始化频谱分析器
     * @param {AudioContext} audioContext - 音频上下文
     * @param {AudioNode} source - 音频源节点
     */
    initSpectrumAnalyser(audioContext, source) {
        // 创建分析器节点
        this.analyser = audioContext.createAnalyser();
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;
        this.analyser.smoothingTimeConstant = this.smoothingValueValue;
        this.analyser.fftSize = this.fftSizeValue;
        
        // 连接音频源到分析器，再连接到目标节点
        source.connect(this.analyser);
        this.analyser.connect(audioContext.destination);
        
        // 设置数据数组
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        
        // 开始频谱分析动画
        this.startSpectrumAnimation();
        
        console.log('频谱分析器初始化完成');
        this.log('success', '频谱分析器已初始化');
    }
    
    /**
     * 更新分析器设置
     */
    updateAnalyserSettings() {
        if (this.analyser) {
            this.analyser.fftSize = this.fftSizeValue;
            this.analyser.smoothingTimeConstant = this.smoothingValueValue;
            
            // 更新数据数组
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            
            console.log('分析器设置已更新:', {
                fftSize: this.fftSizeValue,
                smoothingTimeConstant: this.smoothingValueValue,
                bufferLength: this.bufferLength
            });
        }
    }
    
    /**
     * 开始频谱分析动画
     */
    startSpectrumAnimation() {
        if (!this.spectrumCtx || !this.analyser) return;
        
        // 添加鼠标事件监听
        this.setupSpectrumMouseEvents();
        
        const draw = () => {
            this.spectrumAnimationId = requestAnimationFrame(draw);
            
            if (!this.isSpectrumVisible) return;
            
            // 获取频谱数据
            this.analyser.getByteFrequencyData(this.dataArray);
            
            // 绘制频谱
            this.drawSpectrum();
            
            // 更新频谱信息
            this.updateSpectrumInfo();
            
            // 绘制选择区域（如果有）
            this.drawSelection();
        };
        
        draw();
    }
    
    /**
     * 设置频谱鼠标事件
     */
    setupSpectrumMouseEvents() {
        if (!this.spectrumCanvas) return;
        
        // 初始化选择状态
        this.isSelecting = false;
        this.selectionStart = { x: 0, y: 0 };
        this.selectionEnd = { x: 0, y: 0 };
        this.selectedRange = null;
        
        // 鼠标按下事件
        this.spectrumCanvas.addEventListener('mousedown', (e) => {
            const rect = this.spectrumCanvas.getBoundingClientRect();
            this.isSelecting = true;
            this.selectionStart = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            this.selectionEnd = { ...this.selectionStart };
        });
        
        // 鼠标移动事件
        this.spectrumCanvas.addEventListener('mousemove', (e) => {
            if (!this.isSelecting) return;
            
            const rect = this.spectrumCanvas.getBoundingClientRect();
            this.selectionEnd = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        });
        
        // 鼠标释放事件
        this.spectrumCanvas.addEventListener('mouseup', () => {
            if (!this.isSelecting) return;
            
            this.isSelecting = false;
            
            // 计算选择区域
            const startX = Math.min(this.selectionStart.x, this.selectionEnd.x);
            const endX = Math.max(this.selectionStart.x, this.selectionEnd.x);
            
            // 只有当选择区域足够大时才保存
            if (endX - startX > 10) {
                this.selectedRange = {
                    startX,
                    endX,
                    startY: Math.min(this.selectionStart.y, this.selectionEnd.y),
                    endY: Math.max(this.selectionStart.y, this.selectionEnd.y)
                };
                
                // 放大选择区域
                this.zoomToSelection();
            } else {
                this.selectedRange = null;
            }
        });
        
        // 鼠标离开事件
        this.spectrumCanvas.addEventListener('mouseleave', () => {
            this.isSelecting = false;
        });
    }
    
    /**
     * 绘制选择区域
     */
    drawSelection() {
        if (!this.spectrumCtx || !this.isSelecting || !this.selectionStart || !this.selectionEnd) return;
        
        const startX = Math.min(this.selectionStart.x, this.selectionEnd.x);
        const endX = Math.max(this.selectionStart.x, this.selectionEnd.x);
        const startY = Math.min(this.selectionStart.y, this.selectionEnd.y);
        const endY = Math.max(this.selectionStart.y, this.selectionEnd.y);
        
        // 绘制选择区域
        this.spectrumCtx.fillStyle = 'rgba(79, 172, 254, 0.2)';
        this.spectrumCtx.fillRect(startX, startY, endX - startX, endY - startY);
        
        // 绘制选择边框
        this.spectrumCtx.strokeStyle = '#4facfe';
        this.spectrumCtx.lineWidth = 2;
        this.spectrumCtx.strokeRect(startX, startY, endX - startX, endY - startY);
    }
    
    /**
     * 放大到选择区域
     */
    zoomToSelection() {
        if (!this.selectedRange) return;
        
        // 计算频率范围
        const sampleRate = this.analyser.context.sampleRate;
        const totalFrequency = sampleRate / 2;
        
        const startFreq = (this.selectedRange.startX / this.spectrumCanvas.width) * totalFrequency;
        const endFreq = (this.selectedRange.endX / this.spectrumCanvas.width) * totalFrequency;
        
        // 更新分析器设置（这里简化处理，实际可以实现更复杂的缩放逻辑）
        console.log('放大到频率范围:', startFreq.toFixed(2), 'Hz -', endFreq.toFixed(2), 'Hz');
        this.log('info', `放大到频率范围: ${startFreq.toFixed(2)} Hz - ${endFreq.toFixed(2)} Hz`);
        
        // 可以在这里实现更复杂的缩放逻辑，比如调整分析器参数或在绘制时只显示选定范围
        
        // 清除选择
        this.selectedRange = null;
    }
    
    /**
     * 停止频谱分析动画
     */
    stopSpectrumAnimation() {
        if (this.spectrumAnimationId) {
            cancelAnimationFrame(this.spectrumAnimationId);
            this.spectrumAnimationId = null;
        }
    }
    
    /**
     * 绘制频谱
     */
    drawSpectrum() {
        if (!this.spectrumCtx || !this.analyser || !this.dataArray) return;
        
        const canvas = this.spectrumCanvas;
        const ctx = this.spectrumCtx;
        
        // 清空画布
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 根据不同的可视化模式绘制
        switch (this.visualizationModeValue) {
            case 'bars':
                this.drawSpectrumBars(ctx, canvas);
                break;
            case 'curve':
                this.drawSpectrumCurve(ctx, canvas);
                break;
            case 'waterfall':
                this.drawWaterfall(ctx, canvas);
                break;
            case 'waveform':
                this.drawWaveform(ctx, canvas);
                break;
        }
    }
    
    /**
     * 绘制频谱柱状图
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {HTMLCanvasElement} canvas - Canvas元素
     */
    drawSpectrumBars(ctx, canvas) {
        const barWidth = (canvas.width / this.bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = (this.dataArray[i] / 255) * canvas.height;
            
            // 颜色渐变
            const hue = (i / this.bufferLength) * 360;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            
            // 绘制柱子
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
            
            x += barWidth + 1;
        }
    }
    
    /**
     * 绘制频谱曲线
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {HTMLCanvasElement} canvas - Canvas元素
     */
    drawSpectrumCurve(ctx, canvas) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00f2fe';
        ctx.beginPath();
        
        const sliceWidth = canvas.width / this.bufferLength;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 255.0;
            const y = v * canvas.height / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        
        // 添加渐变填充
        ctx.fillStyle = 'rgba(79, 172, 254, 0.1)';
        ctx.fill();
    }
    
    /**
     * 绘制瀑布图
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {HTMLCanvasElement} canvas - Canvas元素
     */
    drawWaterfall(ctx, canvas) {
        // 保存当前数据到瀑布图数据数组
        this.waterfallData.push(new Uint8Array(this.dataArray));
        
        // 限制瀑布图数据长度
        if (this.waterfallData.length > canvas.height) {
            this.waterfallData.shift();
        }
        
        // 绘制瀑布图
        for (let row = 0; row < this.waterfallData.length; row++) {
            const dataRow = this.waterfallData[row];
            for (let col = 0; col < dataRow.length; col++) {
                const value = dataRow[col];
                const hue = (value / 255) * 360;
                const alpha = 0.8;
                
                ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
                
                // 计算坐标，从底部向上绘制
                const x = (col / this.bufferLength) * canvas.width;
                const y = canvas.height - row - 1;
                
                ctx.fillRect(x, y, 2, 1);
            }
        }
    }
    
    /**
     * 绘制时域波形图
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     * @param {HTMLCanvasElement} canvas - Canvas元素
     */
    drawWaveform(ctx, canvas) {
        // 获取时域数据
        const bufferLength = this.analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00f2fe';
        ctx.beginPath();
        
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }
    
    /**
     * 更新频谱信息显示
     */
    updateSpectrumInfo() {
        if (!this.dataArray || !this.peakFrequency || !this.peakEnergy || !this.averageEnergy) return;
        
        // 计算峰值频率
        let peakIndex = 0;
        let peakValue = 0;
        let sum = 0;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            const value = this.dataArray[i];
            sum += value;
            
            if (value > peakValue) {
                peakValue = value;
                peakIndex = i;
            }
        }
        
        // 计算频率值
        const sampleRate = this.analyser.context.sampleRate;
        const peakFreq = Math.round((peakIndex / this.bufferLength) * (sampleRate / 2));
        const avgEnergy = Math.round(sum / this.dataArray.length);
        
        // 更新DOM显示
        this.peakFrequency.textContent = `${peakFreq} Hz`;
        this.peakEnergy.textContent = peakValue;
        this.averageEnergy.textContent = avgEnergy;
    }
    
    /**
     * 更新频谱显示
     */
    updateSpectrumDisplay() {
        if (!this.spectrumCtx) return;
        
        // 清空画布
        this.spectrumCtx.fillStyle = '#000000';
        this.spectrumCtx.fillRect(0, 0, this.spectrumCanvas.width, this.spectrumCanvas.height);
        
        // 如果是瀑布图，清空历史数据
        if (this.visualizationModeValue === 'waterfall') {
            this.waterfallData = [];
        }
    }
    
    /**
     * 保存频谱快照
     */
    saveSpectrumSnapshot() {
        if (!this.spectrumCanvas) return;
        
        try {
            // 创建下载链接
            const dataURL = this.spectrumCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = `spectrum-snapshot-${new Date().getTime()}.png`;
            link.click();
            
            this.log('success', '频谱快照已保存');
        } catch (error) {
            console.error('保存频谱快照失败:', error);
            this.log('error', `保存频谱快照失败: ${error.message}`);
        }
    }
    
    /**
     * 清空频谱数据
     */
    clearSpectrumData() {
        if (this.spectrumCtx) {
            this.spectrumCtx.fillStyle = '#000000';
            this.spectrumCtx.fillRect(0, 0, this.spectrumCanvas.width, this.spectrumCanvas.height);
        }
        
        this.waterfallData = [];
        this.log('info', '频谱数据已清空');
    }
    
    /**
     * 读取音频文件
     * @param {File} file - 音频文件
     * @returns {Promise<ArrayBuffer>} - 音频数据
     */
    readAudioFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(file);
        });
    }
    
    /**
     * 提取音频特征
     * @param {AudioBuffer} audioBuffer - 解码后的音频数据
     * @returns {Object} - 音频特征数据
     */
    extractAudioFeatures(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const frameSize = Math.floor(sampleRate * 0.02); // 20ms帧
        const hopSize = Math.floor(sampleRate * 0.01); // 10ms hop
        
        const energyValues = [];
        const timeValues = [];
        
        // 计算每帧的能量
        for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
            let energy = 0;
            for (let j = 0; j < frameSize; j++) {
                energy += Math.abs(channelData[i + j]);
            }
            energy /= frameSize;
            energyValues.push(energy);
            timeValues.push(i / sampleRate * 1000); // 转换为毫秒
        }
        
        return {
            energy: energyValues,
            time: timeValues,
            sampleRate: sampleRate,
            frameSize: frameSize,
            hopSize: hopSize
        };
    }
    
    /**
     * 生成备用逐字时间戳（均匀分配）
     */
    generateFallbackWordTimestamps() {
        if (!this.parsedData.lyricLines) {
            return;
        }
        
        // 为每个歌词行生成逐字时间戳
        this.parsedData.lyricLines.forEach((line) => {
            if (line.type === 'lyric') {
                // 将歌词文本拆分为单个字符
                const words = line.text.split('');
                line.wordTimestamps = [];
                
                // 获取该行的开始和结束时间
                if (!line.timestamps || line.timestamps.length === 0) {
                    // 如果没有时间戳，跳过该行
                    return;
                }
                
                const lineStartTime = line.timestamps[0].totalMilliseconds;
                const lineEndTime = line.timestamps[line.timestamps.length - 1].totalMilliseconds;
                
                // 使用均匀分配算法
                this.assignUniformTimestamps(line, words, lineStartTime, lineEndTime);
            }
        });
    }
    
    /**
     * 生成逐字时间戳
     * @param {Object} audioFeatures - 音频特征数据
     */
    generateWordTimestamps(audioFeatures) {
        if (!this.parsedData.lyricLines) {
            return;
        }
        
        // 找到能量峰值点
        const peaks = this.findEnergyPeaks(audioFeatures.energy, audioFeatures.time);
        
        // 为每个歌词行生成逐字时间戳
        this.parsedData.lyricLines.forEach((line) => {
            if (line.type === 'lyric') {
                // 将歌词文本拆分为单个字符
                const words = line.text.split('');
                line.wordTimestamps = [];
                
                // 获取该行的开始和结束时间
                if (!line.timestamps || line.timestamps.length === 0) {
                    // 如果没有时间戳，跳过该行
                    return;
                }
                
                const lineStartTime = line.timestamps[0].totalMilliseconds;
                const lineEndTime = line.timestamps[line.timestamps.length - 1].totalMilliseconds;
                
                // 确保开始时间小于结束时间
                if (lineStartTime >= lineEndTime) {
                    // 使用均匀分配算法
                    this.assignUniformTimestamps(line, words, lineStartTime, lineStartTime + 1000);
                    return;
                }
                
                // 过滤该行时间范围内的峰值
                const linePeaks = peaks.filter(peak => 
                    peak.time >= lineStartTime && peak.time <= lineEndTime
                );
                
                // 为每个字符分配时间戳
                this.assignWordTimestamps(line, words, linePeaks, lineStartTime, lineEndTime);
            }
        });
    }
    
    /**
     * 查找能量峰值点
     * @param {Array<number>} energyValues - 能量值数组
     * @param {Array<number>} timeValues - 时间值数组
     * @returns {Array<Object>} - 峰值点数组
     */
    findEnergyPeaks(energyValues, timeValues) {
        if (!energyValues || energyValues.length === 0) {
            return [];
        }
        
        const peaks = [];
        const threshold = this.calculateEnergyThreshold(energyValues);
        
        // 查找局部最大值
        for (let i = 1; i < energyValues.length - 1; i++) {
            const current = energyValues[i];
            const prev = energyValues[i - 1];
            const next = energyValues[i + 1];
            
            // 确保所有值都是有效的数字
            if (isNaN(current) || isNaN(prev) || isNaN(next)) {
                continue;
            }
            
            if (current > prev && current > next && current > threshold) {
                peaks.push({
                    time: timeValues[i] || 0,
                    energy: current
                });
            }
        }
        
        // 按时间排序
        return peaks.sort((a, b) => a.time - b.time);
    }
    
    /**
     * 计算能量阈值
     * @param {Array<number>} energyValues - 能量值数组
     * @returns {number} - 能量阈值
     */
    calculateEnergyThreshold(energyValues) {
        if (!energyValues || energyValues.length === 0) {
            return 0;
        }
        
        // 过滤掉无效值
        const validValues = energyValues.filter(val => !isNaN(val) && isFinite(val));
        if (validValues.length === 0) {
            return 0;
        }
        
        // 使用能量值的中位数作为阈值
        const sorted = [...validValues].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        // 使用更保守的阈值，避免漏掉峰值
        return median * 1.2;
    }
    
    /**
     * 为每个字分配时间戳
     * @param {Object} line - 歌词行
     * @param {Array<string>} words - 字符数组
     * @param {Array<Object>} peaks - 峰值点数组
     * @param {number} startTime - 行开始时间
     * @param {number} endTime - 行结束时间
     */
    assignWordTimestamps(line, words, peaks, startTime, endTime) {
        // 确保参数有效
        if (!words || words.length === 0) {
            return;
        }
        
        // 如果没有足够的峰值或峰值数组为空，使用均匀分配
        if (!peaks || peaks.length < words.length / 2) {
            this.assignUniformTimestamps(line, words, startTime, endTime);
            return;
        }
        
        // 为每个字符分配峰值时间戳
        words.forEach((word, wordIndex) => {
            try {
                // 找到最适合该字符的峰值
                const peakIndex = Math.floor((wordIndex / words.length) * peaks.length);
                const peak = peaks[peakIndex] || { time: startTime + (wordIndex * (endTime - startTime) / words.length) };
                
                // 确保峰值时间有效
                const peakTime = peak.time || startTime + (wordIndex * (endTime - startTime) / words.length);
                
                // 计算结束时间
                const nextPeakIndex = peakIndex + 1;
                const nextPeak = nextPeakIndex < peaks.length ? peaks[nextPeakIndex] : { time: endTime };
                const charEndTime = nextPeak.time || endTime;
                
                // 确保时间戳有效且有序
                const adjustedStartTime = Math.max(peakTime, startTime);
                const adjustedEndTime = Math.min(charEndTime, endTime);
                
                line.wordTimestamps.push({
                    word: word,
                    startTime: adjustedStartTime,
                    endTime: adjustedEndTime
                });
            } catch (error) {
                console.error('分配时间戳失败:', error);
                // 如果出错，使用均匀分配作为备选
                this.assignUniformTimestamps(line, words, startTime, endTime);
            }
        });
    }
    
    /**
     * 均匀分配时间戳（备用方法）
     * @param {Object} line - 歌词行
     * @param {Array<string>} words - 字符数组
     * @param {number} startTime - 行开始时间
     * @param {number} endTime - 行结束时间
     */
    assignUniformTimestamps(line, words, startTime, endTime) {
        const totalDuration = endTime - startTime;
        const wordDuration = totalDuration / words.length;
        
        words.forEach((word, wordIndex) => {
            const start = startTime + (wordIndex * wordDuration);
            const end = start + wordDuration;
            
            line.wordTimestamps.push({
                word: word,
                startTime: start,
                endTime: end
            });
        });
    }

    /**
     * 显示设置区域
     */
    showSettings() {
        this.settingsSection.style.display = 'block';
    }

    /**
     * 隐藏设置区域
     */
    hideSettings() {
        this.settingsSection.style.display = 'none';
    }
    
    /**
     * 处理批量翻译
     */
    async handleBatchTranslate() {
        if (this.uploadedFiles.length === 0) {
            alert('请先上传歌词文件');
            return;
        }
        
        this.showLoading();
        
        try {
            // 更新AI服务配置
            this.aiService.switchService(
                this.translationApi.value,
                this.apiKey.value.trim()
            );
            
            // 翻译所有上传的文件
            for (let i = 0; i < this.uploadedFiles.length; i++) {
                this.currentFileIndex = i;
                await this.translateSingleFile(this.uploadedFiles[i]);
            }
            
            alert(`批量翻译完成！共翻译了 ${this.uploadedFiles.length} 个文件。`);
        } catch (error) {
            console.error('批量翻译失败:', error);
            alert(`批量翻译失败: ${error.message}\n请检查文件格式或重试`);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * 翻译单个文件（用于批量翻译）
     * @param {File} file - 要翻译的文件
     */
    async translateSingleFile(file) {
        try {
            const text = await FileUtils.readFile(file);
            
            // 解析文件
            const parseResult = this.parserManager.parse(text);
            const parsedData = parseResult.data;
            const parser = parseResult.parser;
            
            // 提取需要翻译的文本
            let textToTranslate = '';
            let textElements = [];
            
            // 根据不同格式提取文本
            if (parsedData.lyricLines) {
                // LRC 格式
                textElements = parsedData.lyricLines.filter(line => line.type === 'lyric');
                textToTranslate = textElements.map(line => line.text).join('\n');
            } else if (parsedData.subtitleLines) {
                // SRT 格式
                textElements = parsedData.subtitleLines;
                textToTranslate = textElements.map(sub => sub.textLines.join('\n')).join('\n\n');
            } else if (parsedData.subtitles) {
                // ASS 格式
                textElements = parsedData.subtitles;
                textToTranslate = textElements.map(sub => sub.text).join('\n\n');
            } else if (parsedData.textLines) {
                // TXT 格式
                textElements = parsedData.textLines;
                textToTranslate = textElements.map(line => line.text).join('\n');
            }
            
            // 调用 AI 翻译
            const translatedText = await this.aiService.translate(
                textToTranslate, 
                this.targetLang.value, 
                this.sourceLang.value
            );
            
            // 合并翻译结果
            this.mergeTranslationResults(textElements, translatedText);
            
            // 保存翻译结果到文件数据中
            file.translatedData = parsedData;
            file.parser = parser;
            file.originalText = text;
        } catch (error) {
            console.error(`翻译文件 ${file.name} 失败:`, error);
            // 继续翻译其他文件
        }
    }
    
    /**
     * 处理批量下载
     */
    handleBatchDownload() {
        if (this.uploadedFiles.length === 0) {
            alert('请先上传并翻译歌词文件');
            return;
        }
        
        // 下载所有已翻译的文件
        this.uploadedFiles.forEach(file => {
            if (file.translatedData) {
                this.downloadSingleFile(file);
            }
        });
    }
    
    /**
     * 下载单个文件
     * @param {File} file - 要下载的文件
     */
    downloadSingleFile(file) {
        if (!file.translatedData || !file.parser) {
            return;
        }
        
        // 生成翻译后的文本
        const translatedText = file.parser.generate(file.translatedData, this.includeOriginal.checked);
        
        // 生成文件名
        const fileName = `${file.name.replace(/\.[^/.]+$/, '')}_translated.${file.name.split('.').pop()}`;
        
        // 下载文件
        FileUtils.downloadFile(fileName, translatedText);
    }
    
    /**
     * 合并翻译结果到文本元素
     * @param {Array<Object>} textElements - 文本元素数组
     * @param {string} translatedText - 翻译后的文本
     */
    mergeTranslationResults(textElements, translatedText) {
        // 按格式合并翻译结果
        const translatedLines = translatedText.split('\n');
        let lineIndex = 0;
        
        textElements.forEach(element => {
            if (element.type === 'lyric') {
                // LRC 格式
                element.translatedText = translatedLines[lineIndex] || element.text;
                lineIndex++;
            } else if (element.textLines) {
                // SRT 格式
                const lineCount = element.textLines.length;
                element.translatedTextLines = translatedLines.slice(lineIndex, lineIndex + lineCount);
                lineIndex += lineCount + 1; // +1 跳过空行
            } else if (element.text) {
                // ASS 或 TXT 格式
                element.translatedText = translatedLines[lineIndex] || element.text;
                lineIndex++; // +1 处理下一行，不需要跳过空行
            }
        });
    }
    
    /**
     * 切换标签页
     * @param {Event} e - 标签切换事件
     */
    switchTab(e) {
        const tab = e.target.dataset.tab;
        
        // 更新标签按钮状态
        this.tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // 更新标签内容显示
        this.tabPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        const targetPanel = document.getElementById(`${tab}Panel`);
        if (targetPanel) {
            targetPanel.classList.add('active');
            
            // 初始化逐字歌词编辑器
            if (tab === 'wordByWord') {
                this.initTimelineEditor();
            }
        }
    }
    
    /**
     * 显示加载状态
     */
    showLoading() {
        if (this.loading) {
            this.loading.style.display = 'flex';
        }
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        if (this.loading) {
            this.loading.style.display = 'none';
        }
    }
    
    /**
     * 翻译歌词
     */
    async translateLyrics() {
        if (this.uploadedFiles.length === 0) {
            alert('请先上传歌词文件');
            this.log('warning', '翻译尝试失败：未上传歌词文件');
            return;
        }
        
        this.showLoading();
        this.log('info', '开始翻译歌词');
        
        try {
            // 处理当前文件
            const file = this.uploadedFiles[this.currentFileIndex];
            this.log('info', `处理文件: ${file.name}`);
            
            const text = await FileUtils.readFile(file);
            this.log('success', '文件读取成功');
            
            // 解析文件
            this.log('info', '开始解析文件');
            const parseResult = this.parserManager.parse(text);
            this.parsedData = parseResult.data;
            this.parser = parseResult.parser;
            this.log('success', `文件解析成功，格式: ${parseResult.format}`);
            
            // 翻译歌词行
            if (this.parsedData.lyricLines) {
                this.log('info', `开始翻译 ${this.parsedData.lyricLines.length} 行歌词`);
                this.parsedData.lyricLines = await this.aiService.translateLyricLines(
                    this.parsedData.lyricLines, 
                    this.targetLang.value
                );
                this.log('success', '歌词行翻译完成');
            } else {
                // 其他格式的翻译逻辑
                let textToTranslate = '';
                let textElements = [];
                
                if (this.parsedData.subtitleLines) {
                    // SRT 格式
                    textElements = this.parsedData.subtitleLines;
                    textToTranslate = textElements.map(sub => sub.textLines.join('\n')).join('\n\n');
                    this.log('info', `开始翻译 ${textElements.length} 个字幕`);
                } else if (this.parsedData.subtitles) {
                    // ASS 格式
                    textElements = this.parsedData.subtitles;
                    textToTranslate = textElements.map(sub => sub.text).join('\n\n');
                    this.log('info', `开始翻译 ${textElements.length} 个字幕`);
                } else if (this.parsedData.textLines) {
                    // TXT 格式
                    textElements = this.parsedData.textLines;
                    textToTranslate = textElements.map(line => line.text).join('\n');
                    this.log('info', `开始翻译 ${textElements.length} 行文本`);
                }
                
                // 调用翻译服务
                const translatedText = await this.aiService.translate(
                    textToTranslate, 
                    this.targetLang.value, 
                    this.sourceLang.value
                );
                this.log('success', '文本翻译完成');
                
                // 合并翻译结果
                this.mergeTranslationResults(textElements, translatedText);
                this.log('success', '翻译结果合并完成');
            }
            
            // 显示结果
            this.showResults(text);
            this.log('success', '翻译结果显示完成');
        } catch (error) {
            console.error('翻译失败:', error);
            this.log('error', `翻译失败: ${error.message}`);
            
            // 添加更友好的用户提示
            let userMessage = `翻译失败: ${error.message}`;
            
            if (error.message.includes('跨域错误') || error.message.includes('Failed to fetch')) {
                userMessage += '\n\n请确保已在项目根目录执行 npm start 启动本地代理服务器';
                userMessage += '\n启动命令：npm start';
                userMessage += '\n启动后代理服务器将运行在 http://localhost:3001/translate';
            }
            
            alert(userMessage);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * 显示翻译结果
     * @param {string} originalText - 原文文本
     */
    showResults(originalText) {
        // 更新原文显示
        if (this.originalLyrics) {
            this.originalLyrics.textContent = originalText;
        }
        
        // 生成翻译后的文本
        const translatedText = this.parser.generate(this.parsedData, this.includeOriginal.checked);
        
        // 更新译文显示
        if (this.translatedLyrics) {
            this.translatedLyrics.textContent = translatedText;
        }
        
        // 显示结果区域
        this.resultSection.style.display = 'block';
    }
    
    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型：success, error, warning
     */
    showNotification(message, type = 'success') {
        if (!this.notification || !this.notificationText) return;
        
        this.notificationText.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notification.style.display = 'block';
        
        // 3秒后自动隐藏
        setTimeout(() => {
            this.hideNotification();
        }, 3000);
    }
    
    /**
     * 隐藏通知
     */
    hideNotification() {
        if (this.notification) {
            this.notification.style.display = 'none';
        }
    }
    
    /**
     * 显示下载进度
     */
    showDownloadProgress() {
        if (this.downloadProgress) {
            this.downloadProgress.style.display = 'flex';
        }
    }
    
    /**
     * 更新下载进度
     * @param {number} progress - 进度百分比 (0-100)
     */
    updateDownloadProgress(progress) {
        if (this.progressFill && this.progressText) {
            this.progressFill.style.width = `${progress}%`;
            this.progressText.textContent = `正在下载... ${progress}%`;
        }
    }
    
    /**
     * 隐藏下载进度
     */
    hideDownloadProgress() {
        if (this.downloadProgress) {
            this.downloadProgress.style.display = 'none';
        }
    }
    
    /**
     * 下载翻译后的歌词
     */
    downloadTranslatedLyrics() {
        if (!this.parsedData || !this.parser) {
            this.showNotification('请先翻译歌词', 'warning');
            return;
        }
        
        try {
            // 显示下载进度
            this.showDownloadProgress();
            this.updateDownloadProgress(0);
            
            // 生成翻译后的文本
            const outputFormat = this.outputFormat.value;
            let translatedText;
            
            // 检查是否需要使用特定格式生成器
            switch (outputFormat) {
                case 'amll':
                    // 使用AMLL格式生成器
                    if (typeof AMLLGenerator !== 'undefined') {
                        const amllGenerator = new AMLLGenerator();
                        translatedText = amllGenerator.generate(this.parsedData, this.includeOriginal.checked);
                    } else {
                        translatedText = this.parser.generate(this.parsedData, this.includeOriginal.checked);
                    }
                    break;
                case 'ttml':
                    // 使用TTML格式生成器
                    if (typeof TTMLGenerator !== 'undefined') {
                        const ttmlGenerator = new TTMLGenerator();
                        translatedText = ttmlGenerator.generate(this.parsedData, this.includeOriginal.checked);
                    } else {
                        translatedText = this.parser.generate(this.parsedData, this.includeOriginal.checked);
                    }
                    break;
                case 'db':
                    // 使用DB格式生成器
                    if (typeof DBGenerator !== 'undefined') {
                        const dbGenerator = new DBGenerator();
                        translatedText = dbGenerator.generate(this.parsedData, this.includeOriginal.checked);
                    } else {
                        translatedText = this.parser.generate(this.parsedData, this.includeOriginal.checked);
                    }
                    break;
                default:
                    // 使用原解析器生成
                    translatedText = this.parser.generate(this.parsedData, this.includeOriginal.checked);
                    break;
            }
            
            this.updateDownloadProgress(30);
            
            // 生成文件名
            const originalFile = this.uploadedFiles[this.currentFileIndex];
            const fileExt = outputFormat === 'auto' ? originalFile.name.split('.').pop() : outputFormat;
            const fileName = `${originalFile.name.replace(/\.[^/.]+$/, '')}_translated.${fileExt}`;
            this.updateDownloadProgress(60);
            
            // 下载文件
            FileUtils.downloadFile(translatedText, fileName);
            this.updateDownloadProgress(100);
            
            // 隐藏进度条并显示成功通知
            setTimeout(() => {
                this.hideDownloadProgress();
                this.showNotification(`文件 "${fileName}" 下载成功！`);
            }, 500);
            
        } catch (error) {
            this.hideDownloadProgress();
            this.showNotification(`下载失败: ${error.message}`, 'error');
            console.error('下载失败:', error);
        }
    }
    
    /**
     * 播放音频
     */
    playAudio() {
        if (!this.currentAudio) {
            this.showNotification('请先上传音频文件', 'warning');
            return;
        }
        
        if (!this.parsedData || !this.parsedData.lyricLines) {
            this.showNotification('请先解析歌词文件', 'warning');
            return;
        }
        
        try {
            if (!this.audioPlayer) {
                // 创建音频播放器
                this.audioPlayer = new Audio(URL.createObjectURL(this.currentAudio));
                this.audioPlayer.addEventListener('timeupdate', () => {
                    this.updatePlaybackTime();
                });
                this.audioPlayer.addEventListener('ended', () => {
                    this.onAudioEnded();
                });
                
                // 初始化频谱分析器
                this.initAudioContext();
            }
            
            this.audioPlayer.play();
            this.isPlaying = true;
            this.playBtn.style.display = 'none';
            this.pauseBtn.style.display = 'inline-block';
            
            this.showNotification('开始播放', 'success');
        } catch (error) {
            console.error('播放失败:', error);
            this.showNotification(`播放失败: ${error.message}`, 'error');
        }
    }
    
    /**
     * 初始化音频上下文和频谱分析器
     */
    initAudioContext() {
        if (!this.currentAudio) return;
        
        try {
            // 检查浏览器是否支持Web Audio API
            if (!window.AudioContext && !window.webkitAudioContext) {
                console.warn('浏览器不支持Web Audio API，无法启用频谱分析');
                return;
            }
            
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建媒体元素源
            this.source = this.audioContext.createMediaElementSource(this.audioPlayer);
            
            // 初始化频谱分析器
            this.initSpectrumAnalyser(this.audioContext, this.source);
            
            console.log('音频上下文和频谱分析器已初始化');
        } catch (error) {
            console.error('初始化音频上下文失败:', error);
            this.log('error', `初始化频谱分析器失败: ${error.message}`);
        }
    }
    
    /**
     * 暂停音频
     */
    pauseAudio() {
        if (this.audioPlayer && this.isPlaying) {
            this.audioPlayer.pause();
            this.isPlaying = false;
            this.playBtn.style.display = 'inline-block';
            this.pauseBtn.style.display = 'none';
            this.showNotification('已暂停', 'success');
        }
    }
    
    /**
     * 停止音频
     */
    stopAudio() {
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer.currentTime = 0;
            this.isPlaying = false;
            this.playBtn.style.display = 'inline-block';
            this.pauseBtn.style.display = 'none';
            this.updatePlaybackTime();
            this.showNotification('已停止', 'success');
        }
    }
    
    /**
     * 音频跳转
     * @param {number} percentage - 跳转百分比
     */
    seekAudio(percentage) {
        if (this.audioPlayer) {
            const duration = this.audioPlayer.duration || 0;
            this.audioPlayer.currentTime = (percentage / 100) * duration;
            this.updatePlaybackTime();
        }
    }
    
    /**
     * 设置播放速度
     * @param {number} speed - 播放速度
     */
    setPlaybackSpeed(speed) {
        if (this.audioPlayer) {
            this.audioPlayer.playbackRate = parseFloat(speed);
            this.showNotification(`播放速度已设置为 ${speed}x`, 'success');
        }
    }
    
    /**
     * 更新播放时间
     */
    updatePlaybackTime() {
        if (!this.audioPlayer) return;
        
        const currentTime = this.audioPlayer.currentTime;
        const duration = this.audioPlayer.duration || 0;
        
        // 更新进度条
        const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
        this.progressSlider.value = percentage;
        
        // 更新时间显示
        const currentTimeStr = this.formatTime(currentTime);
        const durationStr = this.formatTime(duration);
        this.timeDisplay.textContent = `${currentTimeStr} / ${durationStr}`;
        
        // 更新歌词显示
        this.updateLyricDisplay(currentTime);
    }
    
    /**
     * 格式化时间
     * @param {number} seconds - 秒数
     * @returns {string} - 格式化后的时间字符串 (mm:ss)
     */
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * 更新歌词显示
     * @param {number} currentTime - 当前播放时间（秒）
     */
    updateLyricDisplay(currentTime) {
        if (!this.parsedData || !this.parsedData.lyricLines) return;
        
        const lyricLines = this.parsedData.lyricLines.filter(line => line.type === 'lyric');
        if (lyricLines.length === 0) return;
        
        // 找到当前应该显示的歌词行
        let currentIndex = -1;
        for (let i = 0; i < lyricLines.length; i++) {
            const line = lyricLines[i];
            if (!line.timestamps || line.timestamps.length === 0) continue;
            
            const lineStartTime = line.timestamps[0].totalMilliseconds / 1000;
            const nextLineStartTime = i < lyricLines.length - 1 && lyricLines[i + 1].timestamps ? 
                lyricLines[i + 1].timestamps[0].totalMilliseconds / 1000 : 
                Infinity;
            
            if (currentTime >= lineStartTime && currentTime < nextLineStartTime) {
                currentIndex = i;
                break;
            }
        }
        
        if (currentIndex >= 0) {
            // 更新当前行和下一行显示
            this.currentLine.textContent = lyricLines[currentIndex].translatedText || lyricLines[currentIndex].text;
            this.nextLine.textContent = currentIndex < lyricLines.length - 1 ? 
                (lyricLines[currentIndex + 1].translatedText || lyricLines[currentIndex + 1].text) : '';
            
            // 更新逐字高亮
            this.updateWordHighlight(lyricLines[currentIndex], currentTime);
        }
    }
    
    /**
     * 更新逐字高亮
     * @param {Object} lyricLine - 歌词行对象
     * @param {number} currentTime - 当前播放时间（秒）
     */
    updateWordHighlight(lyricLine, currentTime) {
        if (!lyricLine.wordTimestamps || lyricLine.wordTimestamps.length === 0) {
            return;
        }
        
        const lineStartTime = lyricLine.timestamps[0].totalMilliseconds / 1000;
        const relativeTime = currentTime - lineStartTime;
        
        // 构建带高亮的HTML
        let highlightedText = '';
        for (let i = 0; i < lyricLine.wordTimestamps.length; i++) {
            const wordTimestamp = lyricLine.wordTimestamps[i];
            const wordStartTime = wordTimestamp.startTime / 1000;
            const wordEndTime = wordTimestamp.endTime / 1000;
            
            const isHighlighted = relativeTime >= wordStartTime && relativeTime <= wordEndTime;
            const highlightClass = isHighlighted ? 'highlighted' : '';
            highlightedText += `<span class="word ${highlightClass}">${wordTimestamp.word}</span>`;
        }
        
        // 更新当前行显示
        if (this.currentLine) {
            this.currentLine.innerHTML = highlightedText;
        }
    }
    
    /**
     * 音频播放结束事件
     */
    onAudioEnded() {
        this.isPlaying = false;
        this.playBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
        this.showNotification('播放结束', 'success');
    }
    
    /**
     * 初始化时间轴编辑器
     */
    initTimelineEditor() {
        if (!this.timelineEditor || !this.parsedData || !this.parsedData.lyricLines) return;
        
        const lyricLines = this.parsedData.lyricLines.filter(line => line.type === 'lyric');
        if (lyricLines.length === 0) {
            this.timelineEditor.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">没有可编辑的歌词行</p>';
            return;
        }
        
        // 生成时间轴编辑界面
        let html = '';
        for (let i = 0; i < lyricLines.length; i++) {
            const line = lyricLines[i];
            html += this.generateWordLineHTML(line, i);
        }
        
        this.timelineEditor.innerHTML = html;
    }
    
    /**
     * 生成歌词行HTML
     * @param {Object} line - 歌词行对象
     * @param {number} index - 索引
     * @returns {string} - 生成的HTML字符串
     */
    generateWordLineHTML(line, index) {
        const words = line.text.split('');
        let wordItemsHTML = '';
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const startTime = line.wordTimestamps && line.wordTimestamps[i] ? 
                (line.wordTimestamps[i].startTime / 1000).toFixed(2) : '0.00';
            const endTime = line.wordTimestamps && line.wordTimestamps[i] ? 
                (line.wordTimestamps[i].endTime / 1000).toFixed(2) : '0.00';
            
            wordItemsHTML += `
                <div class="word-item">
                    <span class="word-text">${word}</span>
                    <input type="number" step="0.01" min="0" value="${startTime}" 
                           onchange="app.updateWordTimestamp(${index}, ${i}, 'start', this.value)">
                    <span class="word-time">-</span>
                    <input type="number" step="0.01" min="0" value="${endTime}" 
                           onchange="app.updateWordTimestamp(${index}, ${i}, 'end', this.value)">
                </div>
            `;
        }
        
        return `
            <div class="word-line">
                <span class="word-line-number">${index + 1}</span>
                <div class="word-timeline">${wordItemsHTML}</div>
            </div>
        `;
    }
    
    /**
     * 更新单词时间戳
     * @param {number} lineIndex - 行索引
     * @param {number} wordIndex - 单词索引
     * @param {string} type - 时间类型：start 或 end
     * @param {number} value - 时间值（秒）
     */
    updateWordTimestamp(lineIndex, wordIndex, type, value) {
        if (!this.parsedData || !this.parsedData.lyricLines) return;
        
        const lyricLines = this.parsedData.lyricLines.filter(line => line.type === 'lyric');
        if (lineIndex >= lyricLines.length) return;
        
        const line = lyricLines[lineIndex];
        if (!line.wordTimestamps) {
            line.wordTimestamps = [];
        }
        
        // 确保单词时间戳数组有足够的元素
        while (line.wordTimestamps.length <= wordIndex) {
            line.wordTimestamps.push({ startTime: 0, endTime: 0 });
        }
        
        const timeValue = parseFloat(value) * 1000; // 转换为毫秒
        line.wordTimestamps[wordIndex][`${type}Time`] = timeValue;
    }
    
    /**
     * 保存时间轴
     */
    saveTimeline() {
        try {
            if (!this.parsedData) {
                this.showNotification('没有可保存的时间轴数据', 'warning');
                return;
            }
            
            if (!this.uploadedFiles || this.uploadedFiles.length === 0) {
                this.showNotification('没有可保存的文件名', 'warning');
                return;
            }
            
            const fileName = this.uploadedFiles[this.currentFileIndex].name;
            
            if (this.timelineManager) {
                // 使用时间轴管理器保存时间轴数据
                const success = this.timelineManager.saveTimeline(fileName, this.parsedData);
                
                if (success) {
                    this.showNotification('时间轴已保存到本地存储', 'success');
                } else {
                    this.showNotification('时间轴保存失败', 'error');
                }
            } else {
                // 直接保存到本地存储作为备用方案
                const timelineData = this._extractTimelineData();
                const storageKey = `lyrics_timeline_${fileName}`;
                localStorage.setItem(storageKey, JSON.stringify(timelineData));
                this.showNotification('时间轴已保存到本地存储', 'success');
            }
        } catch (error) {
            console.error('保存时间轴失败:', error);
            this.showNotification('时间轴保存失败', 'error');
        }
    }
    
    /**
     * 提取时间轴数据（备用方案）
     * @returns {Object} - 提取的时间轴数据
     * @private
     */
    _extractTimelineData() {
        const timeline = [];
        
        this.parsedData.lyricLines.forEach((line) => {
            if (line.type === 'lyric') {
                timeline.push({
                    text: line.text,
                    timestamps: line.timestamps,
                    wordTimestamps: line.wordTimestamps || []
                });
            } else {
                timeline.push({
                    type: line.type,
                    text: line.text,
                    wordTimestamps: []
                });
            }
        });
        
        return {
            version: '1.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: this.parsedData.metadata || {},
            timeline: timeline
        };
    }
    
    /**
     * 重置时间轴
     */
    resetTimeline() {
        // 重新生成逐字时间戳
        this.generateFallbackWordTimestamps();
        this.initTimelineEditor();
        this.showNotification('时间轴已重置', 'success');
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 检查AIService是否已经定义
    if (typeof AIService === 'undefined') {
        console.error('AIService未定义，尝试重新加载aiService.js');
        // 创建一个新的script元素，动态加载aiService.js
        const script = document.createElement('script');
        script.src = 'js/services/aiService.js';
        script.onload = () => {
            console.log('aiService.js重新加载成功');
            // 初始化应用
            window.app = new LyricTranslatorApp();
        };
        script.onerror = () => {
            console.error('aiService.js重新加载失败');
            // 使用模拟AIService初始化应用
            window.app = new LyricTranslatorApp();
        };
        document.body.appendChild(script);
    } else {
        // 初始化应用
        window.app = new LyricTranslatorApp();
    }
});