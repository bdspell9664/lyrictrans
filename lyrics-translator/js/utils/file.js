/**
 * 文件处理工具类
 * 提供文件读取、类型检测、大小格式化等功能
 */
class FileUtils {
    /**
     * 读取文件内容
     * @param {File} file - 要读取的文件对象
     * @returns {Promise<string>} - 文件内容
     */
    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file, 'utf-8');
        });
    }

    /**
     * 检测文件类型
     * @param {File} file - 文件对象
     * @returns {string} - 文件类型（lrc, srt, ass, ssa, txt）
     */
    static getFileType(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const typeMap = {
            'lrc': 'lrc',
            'srt': 'srt',
            'ass': 'ass',
            'ssa': 'ssa',
            'txt': 'txt'
        };
        return typeMap[extension] || 'txt';
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 文件大小（字节）
     * @returns {string} - 格式化后的文件大小
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 下载文件
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     * @returns {void}
     */
    static downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 提取文件名（不含扩展名）
     * @param {string} filename - 完整文件名
     * @returns {string} - 文件名（不含扩展名）
     */
    static getFileNameWithoutExt(filename) {
        return filename.substring(0, filename.lastIndexOf('.'));
    }

    /**
     * 提取文件扩展名
     * @param {string} filename - 完整文件名
     * @returns {string} - 文件扩展名
     */
    static getFileExt(filename) {
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileUtils;
} else {
    // 浏览器环境全局导出
    window.FileUtils = FileUtils;
}