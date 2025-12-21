/**
 * 解析器管理器
 * 根据文件类型选择合适的解析器
 */
class ParserManager {
    /**
     * 初始化解析器管理器
     */
    constructor() {
        this.parsers = {};
        this._registerParsers();
    }

    /**
     * 注册所有解析器
     * @private
     */
    _registerParsers() {
        // 动态导入解析器，避免依赖顺序问题
        if (typeof LRCParser !== 'undefined') {
            this.registerParser('lrc', new LRCParser());
        }
        if (typeof SRTParser !== 'undefined') {
            this.registerParser('srt', new SRTParser());
        }
        if (typeof ASSParser !== 'undefined') {
            this.registerParser('ass', new ASSParser());
            this.registerParser('ssa', new ASSParser());
        }
        if (typeof TXTParser !== 'undefined') {
            this.registerParser('txt', new TXTParser());
        }
    }

    /**
     * 注册解析器
     * @param {string} type - 文件类型
     * @param {Object} parser - 解析器实例
     */
    registerParser(type, parser) {
        this.parsers[type] = parser;
    }

    /**
     * 获取指定类型的解析器
     * @param {string} type - 文件类型
     * @returns {Object|null} - 解析器实例或null
     */
    getParser(type) {
        return this.parsers[type.toLowerCase()] || null;
    }

    /**
     * 根据文件内容自动检测并选择合适的解析器
     * @param {string} content - 文件内容
     * @returns {Object|null} - 解析器实例或null
     */
    detectParser(content) {
        // 按优先级检测格式
        const detectionOrder = [
            { type: 'lrc', detector: (content) => new LRCParser().isLRCFormat(content) },
            { type: 'srt', detector: (content) => new SRTParser().isSRTFormat(content) },
            { type: 'ass', detector: (content) => new ASSParser().isASSFormat(content) },
            { type: 'txt', detector: () => true } // 默认使用TXT解析器
        ];

        for (const { type, detector } of detectionOrder) {
            if (detector(content)) {
                return this.getParser(type);
            }
        }

        return null;
    }

    /**
     * 获取支持的文件类型
     * @returns {Array<string>} - 支持的文件类型数组
     */
    getSupportedTypes() {
        return Object.keys(this.parsers);
    }

    /**
     * 获取支持的文件扩展名
     * @returns {Array<string>} - 支持的文件扩展名数组
     */
    getSupportedExtensions() {
        const extensions = [];
        for (const parser of Object.values(this.parsers)) {
            if (parser.getSupportedExtensions) {
                extensions.push(...parser.getSupportedExtensions());
            }
        }
        // 去重
        return [...new Set(extensions)];
    }
}

// 创建全局实例
const parserManager = new ParserManager();