/**
 * 用户认证和管理服务
 * 提供用户注册、登录、认证和管理功能
 */
class AuthService {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.settings = this.loadSettings();
        this.translationRecords = this.loadTranslationRecords();
        this.initAdminUser();
    }
    
    /**
     * 初始化管理员用户
     */
    initAdminUser() {
        // 检查是否存在管理员用户，如果不存在则创建
        const adminExists = this.users.some(user => user.username === 'admin');
        if (!adminExists) {
            this.register('admin', 'admin123', 'admin');
        }
    }
    
    /**
     * 保存用户数据到本地存储
     */
    saveUsers() {
        localStorage.setItem('lyricTranslatorUsers', JSON.stringify(this.users));
    }
    
    /**
     * 从本地存储加载用户数据
     * @returns {Array} 用户数组
     */
    loadUsers() {
        const users = localStorage.getItem('lyricTranslatorUsers');
        return users ? JSON.parse(users) : [];
    }
    
    /**
     * 保存系统设置到本地存储
     */
    saveSettings() {
        localStorage.setItem('lyricTranslatorSettings', JSON.stringify(this.settings));
    }
    
    /**
     * 从本地存储加载系统设置
     * @returns {Object} 系统设置
     */
    loadSettings() {
        const settings = localStorage.getItem('lyricTranslatorSettings');
        return settings ? JSON.parse(settings) : {
            systemName: '歌词翻译工具',
            defaultTranslationApi: 'mock'
        };
    }
    
    /**
     * 保存翻译记录到本地存储
     */
    saveTranslationRecords() {
        localStorage.setItem('lyricTranslatorRecords', JSON.stringify(this.translationRecords));
    }
    
    /**
     * 从本地存储加载翻译记录
     * @returns {Array} 翻译记录数组
     */
    loadTranslationRecords() {
        const records = localStorage.getItem('lyricTranslatorRecords');
        return records ? JSON.parse(records) : [];
    }
    
    /**
     * 用户注册
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @param {string} role - 角色（user/admin）
     * @returns {Object} 注册结果
     */
    register(username, password, role = 'user') {
        // 检查用户名是否已存在
        if (this.users.some(user => user.username === username)) {
            return { success: false, message: '用户名已存在' };
        }
        
        // 创建新用户
        const newUser = {
            id: Date.now().toString(),
            username: username,
            password: password, // 简单处理，实际项目中应该加密
            role: role,
            createdAt: new Date().toISOString(),
            apiKeys: {}, // 存储用户的API密钥
            preferences: {
                defaultTranslationApi: 'mock',
                targetLang: 'zh-CN',
                includeOriginal: true
            }
        };
        
        // 添加用户到列表
        this.users.push(newUser);
        this.saveUsers();
        
        return { success: true, message: '注册成功' };
    }
    
    /**
     * 用户登录
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Object} 登录结果
     */
    login(username, password) {
        // 查找用户
        const user = this.users.find(user => 
            user.username === username && user.password === password
        );
        
        if (!user) {
            return { success: false, message: '用户名或密码错误' };
        }
        
        // 保存当前用户
        this.currentUser = user;
        localStorage.setItem('lyricTranslatorCurrentUser', JSON.stringify(user));
        
        return { success: true, message: '登录成功', user: user };
    }
    
    /**
     * 用户登出
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem('lyricTranslatorCurrentUser');
    }
    
    /**
     * 检查用户是否已登录
     * @returns {boolean} 是否已登录
     */
    isLoggedIn() {
        // 从本地存储加载当前用户
        if (!this.currentUser) {
            const currentUserStr = localStorage.getItem('lyricTranslatorCurrentUser');
            if (currentUserStr) {
                this.currentUser = JSON.parse(currentUserStr);
            }
        }
        return !!this.currentUser;
    }
    
    /**
     * 获取当前登录用户
     * @returns {Object|null} 当前用户或null
     */
    getCurrentUser() {
        this.isLoggedIn(); // 检查登录状态
        return this.currentUser;
    }
    
    /**
     * 检查用户是否为管理员
     * @returns {boolean} 是否为管理员
     */
    isAdmin() {
        const user = this.getCurrentUser();
        return user ? user.role === 'admin' : false;
    }
    
    /**
     * 保存用户的API密钥
     * @param {string} service - 服务名称
     * @param {string} apiKey - API密钥
     */
    saveApiKey(service, apiKey) {
        const user = this.getCurrentUser();
        if (user) {
            user.apiKeys[service] = apiKey;
            this.saveUsers();
            // 更新当前用户
            localStorage.setItem('lyricTranslatorCurrentUser', JSON.stringify(user));
        }
    }
    
    /**
     * 获取用户的API密钥
     * @param {string} service - 服务名称
     * @returns {string|null} API密钥或null
     */
    getApiKey(service) {
        const user = this.getCurrentUser();
        return user ? user.apiKeys[service] || '' : '';
    }
    
    /**
     * 保存用户偏好设置
     * @param {Object} preferences - 偏好设置
     */
    savePreferences(preferences) {
        const user = this.getCurrentUser();
        if (user) {
            user.preferences = { ...user.preferences, ...preferences };
            this.saveUsers();
            // 更新当前用户
            localStorage.setItem('lyricTranslatorCurrentUser', JSON.stringify(user));
        }
    }
    
    /**
     * 获取用户偏好设置
     * @returns {Object} 偏好设置
     */
    getPreferences() {
        const user = this.getCurrentUser();
        return user ? user.preferences : {
            defaultTranslationApi: 'mock',
            targetLang: 'zh-CN',
            includeOriginal: true
        };
    }
    
    /**
     * 添加翻译记录
     * @param {Object} record - 翻译记录
     */
    addTranslationRecord(record) {
        const user = this.getCurrentUser();
        if (user) {
            const newRecord = {
                id: Date.now().toString(),
                userId: user.id,
                username: user.username,
                ...record,
                timestamp: new Date().toISOString()
            };
            
            this.translationRecords.push(newRecord);
            // 只保留最近100条记录
            if (this.translationRecords.length > 100) {
                this.translationRecords = this.translationRecords.slice(-100);
            }
            this.saveTranslationRecords();
        }
    }
    
    /**
     * 获取用户的翻译记录
     * @param {string} userId - 用户ID（可选，默认为当前用户）
     * @returns {Array} 翻译记录数组
     */
    getTranslationRecords(userId = null) {
        const targetUserId = userId || this.getCurrentUser()?.id;
        if (!targetUserId) {
            return [];
        }
        return this.translationRecords.filter(record => record.userId === targetUserId);
    }
    
    /**
     * 获取所有用户（管理员功能）
     * @returns {Array} 用户数组
     */
    getAllUsers() {
        if (!this.isAdmin()) {
            return [];
        }
        return this.users;
    }
    
    /**
     * 添加用户（管理员功能）
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @param {string} role - 角色
     * @returns {Object} 添加结果
     */
    addUser(username, password, role = 'user') {
        if (!this.isAdmin()) {
            return { success: false, message: '权限不足' };
        }
        return this.register(username, password, role);
    }
    
    /**
     * 删除用户（管理员功能）
     * @param {string} userId - 用户ID
     * @returns {Object} 删除结果
     */
    deleteUser(userId) {
        if (!this.isAdmin()) {
            return { success: false, message: '权限不足' };
        }
        
        // 不能删除自己
        if (this.currentUser?.id === userId) {
            return { success: false, message: '不能删除当前登录用户' };
        }
        
        this.users = this.users.filter(user => user.id !== userId);
        this.saveUsers();
        
        return { success: true, message: '用户删除成功' };
    }
    
    /**
     * 更新用户角色（管理员功能）
     * @param {string} userId - 用户ID
     * @param {string} role - 新角色
     * @returns {Object} 更新结果
     */
    updateUserRole(userId, role) {
        if (!this.isAdmin()) {
            return { success: false, message: '权限不足' };
        }
        
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            return { success: false, message: '用户不存在' };
        }
        
        user.role = role;
        this.saveUsers();
        
        return { success: true, message: '用户角色更新成功' };
    }
    
    /**
     * 保存系统设置（管理员功能）
     * @param {Object} settings - 系统设置
     */
    saveSystemSettings(settings) {
        if (!this.isAdmin()) {
            return { success: false, message: '权限不足' };
        }
        
        this.settings = { ...this.settings, ...settings };
        this.saveSettings();
        
        return { success: true, message: '系统设置保存成功' };
    }
    
    /**
     * 获取系统设置
     * @returns {Object} 系统设置
     */
    getSystemSettings() {
        return this.settings;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
} else {
    // 浏览器环境全局导出
    window.AuthService = AuthService;
}
