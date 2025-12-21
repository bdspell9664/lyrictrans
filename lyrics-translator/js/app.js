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
        this.authService = new AuthService();
        
        this.initElements();
        this.bindEvents();
        this.initAuth();
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
        
        // 认证相关元素
        this.userInfo = document.getElementById('userInfo');
        this.userName = document.getElementById('userName');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.adminBtn = document.getElementById('adminBtn');
        this.loginForm = document.getElementById('loginForm');
        this.loginUsername = document.getElementById('loginUsername');
        this.loginPassword = document.getElementById('loginPassword');
        this.loginBtn = document.getElementById('loginBtn');
        this.registerBtn = document.getElementById('registerBtn');
        
        // 管理员模态框元素
        this.adminModal = document.getElementById('adminModal');
        this.closeAdminModal = document.getElementById('closeAdminModal');
        this.adminTabs = document.querySelectorAll('.admin-tabs .tab-btn');
        this.adminTabPanels = document.querySelectorAll('.admin-tabs + .tab-panel');
        this.userTableBody = document.getElementById('userTableBody');
        this.addUserBtn = document.getElementById('addUserBtn');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.systemName = document.getElementById('systemName');
        this.defaultTranslationApi = document.getElementById('defaultTranslationApi');
        this.recordsTableBody = document.getElementById('recordsTableBody');
        
        // 批量功能元素
        this.batchTranslateBtn = document.getElementById('batchTranslateBtn');
        this.batchDownloadBtn = document.getElementById('batchDownloadBtn');
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
                this.fileInput.click();
            });
            console.log('浏览按钮事件绑定成功');
        } else {
            console.error('浏览按钮元素未找到');
        }
        
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                console.log('文件选择事件触发');
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
                this.handleDragEnter(e);
            });
            
            this.uploadArea.addEventListener('dragover', (e) => {
                console.log('拖放悬停事件触发');
                this.handleDragOver(e);
            });
            
            this.uploadArea.addEventListener('dragleave', (e) => {
                console.log('拖放离开事件触发');
                this.handleDragLeave(e);
            });
            
            this.uploadArea.addEventListener('drop', (e) => {
                console.log('拖放放下事件触发');
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
                this.audioInput.click();
            });
            console.log('音频浏览按钮事件绑定成功');
        } else {
            console.error('音频浏览按钮元素未找到');
        }
        
        if (this.audioInput) {
            this.audioInput.addEventListener('change', (e) => {
                console.log('音频文件选择事件触发');
                this.handleAudioSelect(e);
            });
            console.log('音频输入事件绑定成功');
        } else {
            console.error('音频输入元素未找到');
        }
        
        if (this.removeAudioBtn) {
            this.removeAudioBtn.addEventListener('click', () => {
                console.log('移除音频按钮点击');
                this.removeAudio();
            });
            console.log('移除音频按钮事件绑定成功');
        } else {
            console.error('移除音频按钮元素未找到');
        }
        
        if (this.generateWordByWordBtn) {
            this.generateWordByWordBtn.addEventListener('click', () => {
                console.log('生成逐字歌词按钮点击');
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
                e.preventDefault();
                e.stopPropagation();
                this.audioUploadArea.classList.add('dragover');
            });
            
            this.audioUploadArea.addEventListener('dragover', (e) => {
                console.log('音频拖放悬停事件触发');
                e.preventDefault();
                e.stopPropagation();
                this.audioUploadArea.classList.add('dragover');
            });
            
            this.audioUploadArea.addEventListener('dragleave', (e) => {
                console.log('音频拖放离开事件触发');
                e.preventDefault();
                e.stopPropagation();
                this.audioUploadArea.classList.remove('dragover');
            });
            
            this.audioUploadArea.addEventListener('drop', (e) => {
                console.log('音频拖放放下事件触发');
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
                this.downloadTranslatedLyrics();
            });
            console.log('下载按钮事件绑定成功');
        } else {
            console.error('下载按钮元素未找到');
        }
        
        // 认证相关事件
        this.bindAuthEvents();
    }
    
    /**
     * 绑定认证相关事件监听器
     */
    bindAuthEvents() {
        // 登录按钮事件
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', () => {
                console.log('登录按钮点击');
                this.handleLogin();
            });
            console.log('登录按钮事件绑定成功');
        }
        
        // 注册按钮事件
        if (this.registerBtn) {
            this.registerBtn.addEventListener('click', () => {
                console.log('注册按钮点击');
                this.handleRegister();
            });
            console.log('注册按钮事件绑定成功');
        }
        
        // 退出按钮事件
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => {
                console.log('退出按钮点击');
                this.handleLogout();
            });
            console.log('退出按钮事件绑定成功');
        }
        
        // 管理员按钮事件
        if (this.adminBtn) {
            this.adminBtn.addEventListener('click', () => {
                console.log('管理员按钮点击');
                this.openAdminModal();
            });
            console.log('管理员按钮事件绑定成功');
        }
        
        // 关闭管理员模态框事件
        if (this.closeAdminModal) {
            this.closeAdminModal.addEventListener('click', () => {
                console.log('关闭管理员模态框');
                this.closeAdminModal();
            });
            console.log('关闭管理员模态框事件绑定成功');
        }
        
        // 点击模态框外部关闭
        if (this.adminModal) {
            this.adminModal.addEventListener('click', (e) => {
                if (e.target === this.adminModal) {
                    console.log('点击模态框外部关闭');
                    this.closeAdminModal();
                }
            });
            console.log('模态框外部点击事件绑定成功');
        }
        
        // 管理员标签切换事件
        this.adminTabs.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                console.log('管理员标签切换事件触发');
                this.switchAdminTab(e);
            });
        });
        
        // 添加用户按钮事件
        if (this.addUserBtn) {
            this.addUserBtn.addEventListener('click', () => {
                console.log('添加用户按钮点击');
                this.handleAddUser();
            });
            console.log('添加用户按钮事件绑定成功');
        }
        
        // 保存设置按钮事件
        if (this.saveSettingsBtn) {
            this.saveSettingsBtn.addEventListener('click', () => {
                console.log('保存设置按钮点击');
                this.handleSaveSettings();
            });
            console.log('保存设置按钮事件绑定成功');
        }
        
        // 批量功能事件
        this.bindBatchEvents();
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
     * 初始化认证状态
     */
    initAuth() {
        if (this.authService.isLoggedIn()) {
            this.showUserInfo();
        } else {
            this.showLoginForm();
        }
    }
    
    /**
     * 显示用户信息
     */
    showUserInfo() {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.userName.textContent = user.username;
            this.userInfo.style.display = 'block';
            this.loginForm.style.display = 'none';
            
            // 如果是管理员，显示管理员按钮
            this.adminBtn.style.display = user.role === 'admin' ? 'inline-block' : 'none';
            
            // 加载用户的API密钥
            this.loadUserApiKeys();
            // 加载用户偏好设置
            this.loadUserPreferences();
        }
    }
    
    /**
     * 显示登录表单
     */
    showLoginForm() {
        this.userInfo.style.display = 'none';
        this.loginForm.style.display = 'flex';
        this.adminBtn.style.display = 'none';
    }
    
    /**
     * 加载用户的API密钥
     */
    loadUserApiKeys() {
        const currentService = this.translationApi.value;
        const apiKey = this.authService.getApiKey(currentService);
        if (apiKey) {
            this.apiKey.value = apiKey;
        }
    }
    
    /**
     * 加载用户偏好设置
     */
    loadUserPreferences() {
        const preferences = this.authService.getPreferences();
        if (preferences) {
            this.translationApi.value = preferences.defaultTranslationApi || 'mock';
            this.targetLang.value = preferences.targetLang || 'zh-CN';
            this.includeOriginal.checked = preferences.includeOriginal || true;
        }
    }
    
    /**
     * 处理登录
     */
    handleLogin() {
        const username = this.loginUsername.value.trim();
        const password = this.loginPassword.value.trim();
        
        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }
        
        const result = this.authService.login(username, password);
        if (result.success) {
            this.showUserInfo();
            alert(result.message);
            this.loginUsername.value = '';
            this.loginPassword.value = '';
        } else {
            alert(result.message);
        }
    }
    
    /**
     * 处理注册
     */
    handleRegister() {
        const username = this.loginUsername.value.trim();
        const password = this.loginPassword.value.trim();
        
        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }
        
        const result = this.authService.register(username, password);
        if (result.success) {
            alert(result.message);
            // 自动登录
            this.authService.login(username, password);
            this.showUserInfo();
            this.loginUsername.value = '';
            this.loginPassword.value = '';
        } else {
            alert(result.message);
        }
    }
    
    /**
     * 处理退出
     */
    handleLogout() {
        this.authService.logout();
        this.showLoginForm();
        // 重置API密钥输入框
        this.apiKey.value = '';
    }
    
    /**
     * 处理翻译API选择变化
     */
    handleTranslationApiChange(e) {
        const api = e.target.value;
        const requiresKey = api !== 'mock';
        
        // 显示或隐藏API密钥输入框
        this.apiKeyField.style.display = requiresKey ? 'block' : 'none';
        
        // 加载当前服务的API密钥
        if (this.authService.isLoggedIn()) {
            const apiKey = this.authService.getApiKey(api);
            this.apiKey.value = apiKey;
        }
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
     * 打开管理员模态框
     */
    openAdminModal() {
        this.adminModal.style.display = 'block';
        this.loadAdminData();
    }
    
    /**
     * 关闭管理员模态框
     */
    closeAdminModal() {
        this.adminModal.style.display = 'none';
    }
    
    /**
     * 切换管理员标签
     * @param {Event} e - 点击事件
     */
    switchAdminTab(e) {
        const targetTab = e.target.dataset.tab;
        
        // 移除所有活动状态
        this.adminTabs.forEach(btn => btn.classList.remove('active'));
        this.adminTabPanels.forEach(panel => panel.classList.remove('active'));
        
        // 添加当前标签活动状态
        e.target.classList.add('active');
        document.getElementById(`${targetTab}Panel`).classList.add('active');
        
        // 如果切换到用户管理或翻译记录，重新加载数据
        if (targetTab === 'users') {
            this.loadUsersData();
        } else if (targetTab === 'records') {
            this.loadTranslationRecords();
        } else if (targetTab === 'settings') {
            this.loadSystemSettings();
        }
    }
    
    /**
     * 加载管理员数据
     */
    loadAdminData() {
        this.loadUsersData();
        this.loadSystemSettings();
        this.loadTranslationRecords();
    }
    
    /**
     * 加载用户数据
     */
    loadUsersData() {
        const users = this.authService.getAllUsers();
        this.renderUserTable(users);
    }
    
    /**
     * 渲染用户表格
     * @param {Array} users - 用户数组
     */
    renderUserTable(users) {
        this.userTableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding: 8px; border: 1px solid #ddd;">${user.id}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${user.username}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${user.role}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(user.createdAt).toLocaleString()}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                    <button class="btn btn-small" onclick="app.handleUpdateUserRole('${user.id}')">修改角色</button>
                    <button class="btn btn-small btn-danger" onclick="app.handleDeleteUser('${user.id}')">删除</button>
                </td>
            `;
            this.userTableBody.appendChild(row);
        });
    }
    
    /**
     * 加载系统设置
     */
    loadSystemSettings() {
        const settings = this.authService.getSystemSettings();
        if (settings) {
            this.systemName.value = settings.systemName || '歌词翻译工具';
            this.defaultTranslationApi.value = settings.defaultTranslationApi || 'mock';
        }
    }
    
    /**
     * 加载翻译记录
     */
    loadTranslationRecords() {
        const records = this.authService.translationRecords;
        this.renderTranslationRecords(records);
    }
    
    /**
     * 渲染翻译记录表格
     * @param {Array} records - 翻译记录数组
     */
    renderTranslationRecords(records) {
        this.recordsTableBody.innerHTML = '';
        
        // 按时间倒序排序
        const sortedRecords = [...records].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        sortedRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding: 8px; border: 1px solid #ddd;">${record.id}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${record.username}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${record.sourceLang || 'auto'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${record.targetLang || 'zh-CN'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${record.service || 'unknown'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(record.timestamp).toLocaleString()}</td>
            `;
            this.recordsTableBody.appendChild(row);
        });
    }
    
    /**
     * 处理添加用户
     */
    handleAddUser() {
        const username = prompt('请输入新用户名:');
        if (!username) return;
        
        const password = prompt('请输入新用户密码:');
        if (!password) return;
        
        const role = prompt('请输入用户角色 (user/admin):', 'user');
        if (!role || !['user', 'admin'].includes(role)) {
            alert('角色必须是 user 或 admin');
            return;
        }
        
        const result = this.authService.addUser(username, password, role);
        if (result.success) {
            alert(result.message);
            this.loadUsersData();
        } else {
            alert(result.message);
        }
    }
    
    /**
     * 处理更新用户角色
     * @param {string} userId - 用户ID
     */
    handleUpdateUserRole(userId) {
        const newRole = prompt('请输入新角色 (user/admin):');
        if (!newRole || !['user', 'admin'].includes(newRole)) {
            alert('角色必须是 user 或 admin');
            return;
        }
        
        const result = this.authService.updateUserRole(userId, newRole);
        if (result.success) {
            alert(result.message);
            this.loadUsersData();
        } else {
            alert(result.message);
        }
    }
    
    /**
     * 处理删除用户
     * @param {string} userId - 用户ID
     */
    handleDeleteUser(userId) {
        if (confirm('确定要删除这个用户吗？')) {
            const result = this.authService.deleteUser(userId);
            if (result.success) {
                alert(result.message);
                this.loadUsersData();
            } else {
                alert(result.message);
            }
        }
    }
    
    /**
     * 处理保存系统设置
     */
    handleSaveSettings() {
        const settings = {
            systemName: this.systemName.value.trim(),
            defaultTranslationApi: this.defaultTranslationApi.value
        };
        
        const result = this.authService.saveSystemSettings(settings);
        if (result.success) {
            alert(result.message);
        } else {
            alert(result.message);
        }
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
            // 保存用户的API密钥和偏好设置
            if (this.authService.isLoggedIn()) {
                const apiKey = this.apiKey.value.trim();
                const currentService = this.translationApi.value;
                if (apiKey) {
                    this.authService.saveApiKey(currentService, apiKey);
                }
                
                // 保存用户偏好设置
                this.authService.savePreferences({
                    defaultTranslationApi: this.translationApi.value,
                    targetLang: this.targetLang.value,
                    includeOriginal: this.includeOriginal.checked
                });
            }
            
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
            
            // 添加翻译记录
            if (this.authService.isLoggedIn()) {
                this.authService.addTranslationRecord({
                    service: this.translationApi.value,
                    sourceLang: this.sourceLang.value,
                    targetLang: this.targetLang.value,
                    fileName: file.name,
                    fileType: FileUtils.getFileExt(file.name),
                    translatedLines: textElements.length
                });
            }
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
            alert('请先上传歌词文件');
            return;
        }
        
        // 检查是否有文件已经翻译
        const translatedFiles = this.uploadedFiles.filter(file => file.translatedData);
        if (translatedFiles.length === 0) {
            alert('请先翻译歌词文件');
            return;
        }
        
        // 选择输出格式
        const outputFormat = prompt('请选择输出格式 (lrc/srt/txt/ass/auto):', 'auto');
        if (!outputFormat) {
            return;
        }
        
        // 下载所有翻译后的文件
        translatedFiles.forEach(file => {
            this.downloadSingleFile(file, outputFormat);
        });
        
        alert(`批量下载完成！共下载了 ${translatedFiles.length} 个文件。`);
    }
    
    /**
     * 下载单个翻译后的文件
     * @param {File} file - 要下载的文件
     * @param {string} outputFormat - 输出格式
     */
    downloadSingleFile(file, outputFormat) {
        if (!file.translatedData || !file.parser) {
            console.error(`文件 ${file.name} 没有翻译数据`);
            return;
        }
        
        const includeOriginal = this.includeOriginal.checked;
        let translatedText;
        let outputExtension;
        
        if (outputFormat === 'auto') {
            // 自动保持原格式
            translatedText = file.parser.generate(file.translatedData, includeOriginal);
            outputExtension = FileUtils.getFileExt(file.name);
        } else {
            // 根据选择的格式生成对应格式的歌词
            outputExtension = outputFormat;
            
            // 获取对应格式的解析器
            const targetParser = this.parserManager.getParser(outputFormat);
            if (targetParser) {
                translatedText = targetParser.generate(file.translatedData, includeOriginal);
            } else {
                // 如果解析器不存在，使用原解析器
                translatedText = file.parser.generate(file.translatedData, includeOriginal);
            }
        }
        
        const fileName = `${FileUtils.getFileNameWithoutExt(file.name)}_translated.${outputExtension}`;
        FileUtils.createDownloadLink(translatedText, fileName);
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
            // 保存用户的API密钥
            if (this.authService.isLoggedIn()) {
                const apiKey = this.apiKey.value.trim();
                const currentService = this.translationApi.value;
                if (apiKey) {
                    this.authService.saveApiKey(currentService, apiKey);
                }
                
                // 保存用户偏好设置
                this.authService.savePreferences({
                    defaultTranslationApi: this.translationApi.value,
                    targetLang: this.targetLang.value,
                    includeOriginal: this.includeOriginal.checked
                });
            }
            
            // 更新AI服务配置
            this.aiService.switchService(
                this.translationApi.value,
                this.apiKey.value.trim()
            );
            
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
            
            // 添加翻译记录
            if (this.authService.isLoggedIn()) {
                this.authService.addTranslationRecord({
                    service: this.translationApi.value,
                    sourceLang: this.sourceLang.value,
                    targetLang: this.targetLang.value,
                    fileName: file.name,
                    fileType: FileUtils.getFileExt(file.name),
                    translatedLines: textElements.length
                });
            }
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
        // 根据不同格式处理翻译结果
        if (this.parsedData.lyricLines) {
            // LRC 格式 - 使用换行符分隔
            const translatedLines = translatedText.split('\n');
            let translateIndex = 0;
            
            textElements.forEach((element, index) => {
                if (element.type === 'lyric') {
                    element.translatedText = translatedLines[translateIndex] || element.text;
                    translateIndex++;
                }
            });
        } else if (this.parsedData.subtitleLines) {
            // SRT 格式 - 使用两个换行符分隔字幕段
            const translatedSegments = translatedText.split('\n\n');
            
            textElements.forEach((element, index) => {
                const segment = translatedSegments[index] || '';
                const subTranslatedLines = segment.split('\n');
                element.translatedLines = element.textLines.map((_, lineIndex) => {
                    return subTranslatedLines[lineIndex] || '';
                });
            });
        } else if (this.parsedData.subtitles) {
            // ASS 格式 - 使用两个换行符分隔字幕段
            const translatedSegments = translatedText.split('\n\n');
            
            textElements.forEach((element, index) => {
                element.translatedText = translatedSegments[index] || element.text;
            });
        } else if (this.parsedData.textLines) {
            // TXT 格式 - 使用换行符分隔
            const translatedLines = translatedText.split('\n');
            
            textElements.forEach((element, index) => {
                element.translatedText = translatedLines[index] || element.text;
            });
        }
    }

    /**
     * 显示翻译结果
     * @param {string} originalText - 原文
     */
    showResults(originalText) {
        // 显示原文
        this.originalLyrics.textContent = originalText;
        
        // 生成并显示翻译后的文本，使用双语模式
        const includeOriginal = this.includeOriginal.checked;
        const translatedText = this.parser.generate(this.parsedData, includeOriginal);
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
        const selectedFormat = this.outputFormat.value;
        const includeOriginal = this.includeOriginal.checked;
        let translatedText;
        let outputExtension;
        
        if (selectedFormat === 'auto') {
            // 自动保持原格式，使用双语模式
            translatedText = this.parser.generate(this.parsedData, includeOriginal);
            outputExtension = FileUtils.getFileExt(file.name);
        } else {
            // 根据选择的格式生成对应格式的歌词，使用双语模式
            outputExtension = selectedFormat;
            
            // 获取对应格式的解析器
            const targetParser = this.parserManager.getParser(selectedFormat);
            if (targetParser) {
                translatedText = targetParser.generate(this.parsedData, includeOriginal);
            } else {
                // 如果解析器不存在，使用原解析器
                translatedText = this.parser.generate(this.parsedData, includeOriginal);
            }
        }
        
        const fileName = `${FileUtils.getFileNameWithoutExt(file.name)}_translated.${outputExtension}`;
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
    console.log('DOM 内容加载完成，初始化应用...');
    app = new LyricTranslatorApp();
    console.log('应用初始化完成');
});