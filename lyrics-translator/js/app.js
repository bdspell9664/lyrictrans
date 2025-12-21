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
        this.aiService = new AIService();
        this.parserManager = new ParserManager();
        
        this.initElements();
        this.bindEvents();
    }

    /**
     * 初始化DOM元素引用
     */
    initElements() {
        // 文件上传相关元素
        this.uploadArea = document.getElementById('uploadArea');
        this.browseBtn = document.getElementById('browseBtn');
        this.fileInput = document.getElementById('fileInput');
        this.fileListSection = document.getElementById('fileListSection');
        this.fileList = document.getElementById('fileList');
        
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
        
        // 加载状态
        this.loading = document.getElementById('loading');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 文件上传事件
        this.browseBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 拖放事件
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // 翻译设置事件
        this.translationApi.addEventListener('change', (e) => this.handleTranslationApiChange(e));
        
        // 翻译按钮事件
        this.translateBtn.addEventListener('click', () => this.translateLyrics());
        
        // 标签切换事件
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });
        
        // 下载按钮事件
        this.downloadBtn.addEventListener('click', () => this.downloadTranslatedLyrics());
    }
    
    /**
     * 处理翻译API选择变化
     */
    handleTranslationApiChange(e) {
        const api = e.target.value;
        const requiresKey = api !== 'mock';
        
        // 显示或隐藏API密钥输入框
        this.apiKeyField.style.display = requiresKey ? 'block' : 'none';
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
     * 处理拖放事件 - 悬停
     * @param {Event} e - 拖放事件
     */
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    /**
     * 处理拖放事件 - 离开
     * @param {Event} e - 拖放事件
     */
    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    /**
     * 处理拖放事件 - 放下
     * @param {Event} e - 拖放事件
     */
    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
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
        
        this.uploadedFiles = [...this.uploadedFiles, ...validFiles];
        this.renderFileList();
        this.showSettings();
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
     * 切换标签页
     * @param {Event} e - 点击事件
     */
    switchTab(e) {
        const targetTab = e.target.dataset.tab;
        
        // 移除所有活动状态
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        this.tabPanels.forEach(panel => panel.classList.remove('active'));
        
        // 添加当前标签活动状态
        e.target.classList.add('active');
        document.getElementById(`${targetTab}Panel`).classList.add('active');
    }

    /**
     * 翻译歌词
     */
    async translateLyrics() {
        if (this.uploadedFiles.length === 0) {
            alert('请先上传歌词文件');
            return;
        }
        
        this.showLoading();
        
        try {
            // 处理当前文件
            const file = this.uploadedFiles[this.currentFileIndex];
            const text = await FileUtils.readFile(file);
            
            // 解析文件
            const parseResult = this.parserManager.parse(text);
            this.parsedData = parseResult.data;
            this.parser = parseResult.parser;
            
            // 提取需要翻译的文本
            let textToTranslate = '';
            let textElements = [];
            
            // 根据不同格式提取文本
            if (this.parsedData.lyricLines) {
                // LRC 格式
                textElements = this.parsedData.lyricLines.filter(line => line.type === 'lyric');
                textToTranslate = textElements.map(line => line.text).join('\n');
            } else if (this.parsedData.subtitleLines) {
                // SRT 格式
                textElements = this.parsedData.subtitleLines;
                textToTranslate = textElements.map(sub => sub.textLines.join('\n')).join('\n\n');
            } else if (this.parsedData.subtitles) {
                // ASS 格式
                textElements = this.parsedData.subtitles;
                textToTranslate = textElements.map(sub => sub.text).join('\n\n');
            } else if (this.parsedData.textLines) {
                // TXT 格式
                textElements = this.parsedData.textLines;
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
            
            // 显示结果
            this.showResults(text);
        } catch (error) {
            console.error('翻译失败:', error);
            alert('翻译失败，请重试');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 合并翻译结果
     * @param {Array} textElements - 文本元素数组
     * @param {string} translatedText - 翻译后的文本
     */
    mergeTranslationResults(textElements, translatedText) {
        const translatedLines = translatedText.split('\n\n');
        
        textElements.forEach((element, index) => {
            if (this.parsedData.lyricLines) {
                // LRC 格式
                if (element.type === 'lyric') {
                    element.translatedText = translatedLines[index] || element.text;
                }
            } else if (this.parsedData.subtitleLines) {
                // SRT 格式
                const subTranslatedLines = translatedLines[index]?.split('\n') || [];
                element.translatedLines = element.textLines.map((_, lineIndex) => {
                    return subTranslatedLines[lineIndex] || '';
                });
            } else if (this.parsedData.subtitles) {
                // ASS 格式
                element.translatedText = translatedLines[index] || element.text;
            } else if (this.parsedData.textLines) {
                // TXT 格式
                element.translatedText = translatedLines[index] || element.text;
            }
        });
    }

    /**
     * 显示翻译结果
     * @param {string} originalText - 原文
     */
    showResults(originalText) {
        // 显示原文
        this.originalLyrics.textContent = originalText;
        
        // 生成并显示翻译后的文本
        const translatedText = this.parser.generate(this.parsedData);
        this.translatedLyrics.textContent = translatedText;
        
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
        
        const file = this.uploadedFiles[this.currentFileIndex];
        const translatedText = this.parser.generate(this.parsedData);
        
        const fileName = `${FileUtils.getFileNameWithoutExt(file.name)}_translated.${FileUtils.getFileExt(file.name)}`;
        FileUtils.createDownloadLink(translatedText, fileName);
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        this.loading.style.display = 'flex';
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        this.loading.style.display = 'none';
    }
}

// 应用初始化
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new LyricTranslatorApp();
});