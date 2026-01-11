

/**
 * 歌词翻译应用主逻辑
 */
class LyricTranslatorApp {
    /**
     * 初始化应用
     */
    constructor() {
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
        
        this.initElements();
        this.bindEvents();
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
        
        // 验证控制台元素是否成功获取
        console.log('控制台元素获取结果:');
        console.log('consoleContainer:', this.consoleContainer);
        console.log('toggleConsoleBtn:', this.toggleConsoleBtn);
        console.log('clearLogBtn:', this.clearLogBtn);
        console.log('consoleLog:', this.consoleLog);
        console.log('proxyStatus:', this.proxyStatus);
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
        
        // 初始化控制台和代理检测
        this.initConsole();
        this.checkProxyStatus();
    }
    
    /**
     * 初始化控制台
     */
    initConsole() {
        this.log('info', '控制台初始化完成');
        this.log('info', '歌词翻译工具启动');
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
        if (!this.proxyStatus) return;
        
        this.proxyStatus.textContent = '代理状态：检查中...';
        this.proxyStatus.className = 'status-indicator checking';
        this.log('info', '开始检查代理服务器状态');
        
        try {
            // 使用 AbortController 实现超时
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            // 检查代理服务器
            const proxyUrl = 'http://localhost:3001/translate';
            const response = await fetch(proxyUrl, {
                method: 'HEAD',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                this.proxyStatus.textContent = '代理状态：在线';
                this.proxyStatus.className = 'status-indicator online';
                this.log('success', '代理服务器在线，可以正常使用翻译功能');
            } else {
                throw new Error(`代理服务器响应错误: ${response.status}`);
            }
        } catch (error) {
            this.proxyStatus.textContent = '代理状态：离线';
            this.proxyStatus.className = 'status-indicator offline';
            
            if (error.name === 'AbortError') {
                this.log('warning', '代理服务器检测超时，可能离线或网络连接问题');
            } else {
                this.log('error', `代理服务器检测失败: ${error.message}`);
            }
            
            // 添加用户操作提示
            this.log('warning', '请在项目根目录执行 npm start 启动代理服务器');
            this.log('info', '启动后代理服务器将运行在 http://localhost:3001/translate');
            this.log('info', '启动命令：npm start');
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
            
            console.log('真实逐字歌词生成完成');
        } catch (error) {
            console.error('音频处理失败:', error);
            // 如果音频处理失败，使用备用的均匀分配算法
            this.generateFallbackWordTimestamps();
            console.log('已使用备用算法生成逐字歌词');
        }
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
                lineIndex += 2; // +2 跳过空行
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
     * 下载翻译后的歌词
     */
    downloadTranslatedLyrics() {
        if (!this.parsedData || !this.parser) {
            alert('请先翻译歌词');
            return;
        }
        
        // 生成翻译后的文本
        const translatedText = this.parser.generate(this.parsedData, this.includeOriginal.checked);
        
        // 生成文件名
        const originalFile = this.uploadedFiles[this.currentFileIndex];
        const fileName = `${originalFile.name.replace(/\.[^/.]+$/, '')}_translated.${originalFile.name.split('.').pop()}`;
        
        // 下载文件
        FileUtils.downloadFile(fileName, translatedText);
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