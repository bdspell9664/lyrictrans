/**
 * 简单可靠的MD5实现
 * 用于百度翻译API签名生成
 */

/**
 * MD5哈希函数
 * @param {string} str - 要哈希的字符串
 * @returns {string} - MD5哈希值
 */
function md5(str) {
    // 确保输入是字符串类型
    if (str === undefined || str === null) {
        str = '';
    } else if (typeof str !== 'string') {
        str = String(str);
    }

    // 检查是否可以使用Node.js的crypto模块
    if (typeof require !== 'undefined') {
        try {
            const crypto = require('crypto');
            return crypto.createHash('md5').update(str, 'utf8').digest('hex');
        } catch (e) {
            // 如果crypto模块不可用，回退到纯JavaScript实现
            console.warn('Node.js crypto模块不可用，使用纯JavaScript MD5实现');
        }
    }

    // 纯JavaScript MD5实现
    const rotateLeft = function (lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    };

    const addUnsigned = function (lX, lY) {
        const lX4 = (lX & 0xFFFF0000) >> 16;
        const lX8 = lX & 0x0000FFFF;
        const lY4 = (lY & 0xFFFF0000) >> 16;
        const lY8 = lY & 0x0000FFFF;
        return (((lX4 + lY4) << 16) + (lX8 + lY8));
    };

    const F = function (x, y, z) {
        return (x & y) | ((~x) & z);
    };

    const G = function (x, y, z) {
        return (x & z) | (y & (~z));
    };

    const H = function (x, y, z) {
        return (x ^ y ^ z);
    };

    const I = function (x, y, z) {
        return (y ^ (x | (~z)));
    };

    const FF = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    const GG = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    const HH = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    const II = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    const convertToWordArray = function (str) {
        const lWordCount = Math.ceil(str.length / 4);
        const lWordArray = [];

        for (let i = 0; i < lWordCount * 4; i += 4) {
            lWordArray.push(
                (str.charCodeAt(i) & 0xFF) << 24 |
                (str.charCodeAt(i + 1) & 0xFF) << 16 |
                (str.charCodeAt(i + 2) & 0xFF) << 8 |
                (str.charCodeAt(i + 3) & 0xFF)
            );
        }

        return lWordArray;
    };

    const wordToHex = function (lValue) {
        const WordToHexValue = [];
        const HexValue = '0123456789abcdef';

        for (let lCount = 0; lCount < 4; lCount++) {
            WordToHexValue[lCount] = HexValue.charAt((lValue >> (28 - lCount * 8)) & 0xF);
        }

        return WordToHexValue.join('');
    };

    const x = convertToWordArray(str);
    let a = 0x67452301;
    let b = 0xEFCDAB89;
    let c = 0x98BADCFE;
    let d = 0x10325476;

    const k = [
        0xD76AA478, 0xE8C7B756, 0x242070DB, 0xC1BDCEEE,
        0xF57C0FAF, 0x4787C62A, 0xA8304613, 0xFD469501,
        0x698098D8, 0x8B44F7AF, 0xFFFF5BB1, 0x895CD7BE,
        0x6B901122, 0xFD987193, 0xA679438E, 0x49B40821,
        0xF61E2562, 0xC040B340, 0x265E5A51, 0xE9B6C7AA,
        0xD62F105D, 0x02441453, 0xD8A1E681, 0xE7D3FBC8,
        0x21E1CDE6, 0xC33707D6, 0xF4D50D87, 0x455A14ED,
        0xA9E3E905, 0xFCEFA3F8, 0x676F02D9, 0x8D2A4C8A,
        0xFFFA3942, 0x8771F681, 0x6D9D6122, 0xFDE5380C,
        0xA4BEEA44, 0x4BDECFA9, 0xF6BB4B60, 0xBEBFBC70,
        0x289B7EC6, 0xEAA127FA, 0xD4EF3085, 0x04881D05,
        0xD9D4D039, 0xE6DB99E5, 0x1FA27CF8, 0xC4AC5665,
        0xF4292244, 0x432AFF97, 0xAB9423A7, 0xFC93A039,
        0x655B59C3, 0x8F0CCC92, 0xFFEFF47D, 0x85845DD1,
        0x6FA87E4F, 0xFE2CE6E0, 0xA3014314, 0x4E0811A1,
        0xF7537E82, 0xBD3AF235, 0x2AD7D2BB, 0xEB86D391
    ];

    const r = [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
        5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
        4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
        6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];

    for (let i = 0; i < x.length; i += 16) {
        let aa = a;
        let bb = b;
        let cc = c;
        let dd = d;

        aa = FF(aa, bb, cc, dd, x[i + 0], r[0], k[0]);
        dd = FF(dd, aa, bb, cc, x[i + 1], r[1], k[1]);
        cc = FF(cc, dd, aa, bb, x[i + 2], r[2], k[2]);
        bb = FF(bb, cc, dd, aa, x[i + 3], r[3], k[3]);
        aa = FF(aa, bb, cc, dd, x[i + 4], r[4], k[4]);
        dd = FF(dd, aa, bb, cc, x[i + 5], r[5], k[5]);
        cc = FF(cc, dd, aa, bb, x[i + 6], r[6], k[6]);
        bb = FF(bb, cc, dd, aa, x[i + 7], r[7], k[7]);
        aa = FF(aa, bb, cc, dd, x[i + 8], r[8], k[8]);
        dd = FF(dd, aa, bb, cc, x[i + 9], r[9], k[9]);
        cc = FF(cc, dd, aa, bb, x[i + 10], r[10], k[10]);
        bb = FF(bb, cc, dd, aa, x[i + 11], r[11], k[11]);
        aa = FF(aa, bb, cc, dd, x[i + 12], r[12], k[12]);
        dd = FF(dd, aa, bb, cc, x[i + 13], r[13], k[13]);
        cc = FF(cc, dd, aa, bb, x[i + 14], r[14], k[14]);
        bb = FF(bb, cc, dd, aa, x[i + 15], r[15], k[15]);

        aa = GG(aa, bb, cc, dd, x[i + 1], r[16], k[16]);
        dd = GG(dd, aa, bb, cc, x[i + 6], r[17], k[17]);
        cc = GG(cc, dd, aa, bb, x[i + 11], r[18], k[18]);
        bb = GG(bb, cc, dd, aa, x[i + 0], r[19], k[19]);
        aa = GG(aa, bb, cc, dd, x[i + 5], r[20], k[20]);
        dd = GG(dd, aa, bb, cc, x[i + 10], r[21], k[21]);
        cc = GG(cc, dd, aa, bb, x[i + 15], r[22], k[22]);
        bb = GG(bb, cc, dd, aa, x[i + 4], r[23], k[23]);
        aa = GG(aa, bb, cc, dd, x[i + 9], r[24], k[24]);
        dd = GG(dd, aa, bb, cc, x[i + 14], r[25], k[25]);
        cc = GG(cc, dd, aa, bb, x[i + 3], r[26], k[26]);
        bb = GG(bb, cc, dd, aa, x[i + 8], r[27], k[27]);
        aa = GG(aa, bb, cc, dd, x[i + 13], r[28], k[28]);
        dd = GG(dd, aa, bb, cc, x[i + 2], r[29], k[29]);
        cc = GG(cc, dd, aa, bb, x[i + 7], r[30], k[30]);
        bb = GG(bb, cc, dd, aa, x[i + 12], r[31], k[31]);

        aa = HH(aa, bb, cc, dd, x[i + 5], r[32], k[32]);
        dd = HH(dd, aa, bb, cc, x[i + 8], r[33], k[33]);
        cc = HH(cc, dd, aa, bb, x[i + 11], r[34], k[34]);
        bb = HH(bb, cc, dd, aa, x[i + 14], r[35], k[35]);
        aa = HH(aa, bb, cc, dd, x[i + 1], r[36], k[36]);
        dd = HH(dd, aa, bb, cc, x[i + 4], r[37], k[37]);
        cc = HH(cc, dd, aa, bb, x[i + 7], r[38], k[38]);
        bb = HH(bb, cc, dd, aa, x[i + 10], r[39], k[39]);
        aa = HH(aa, bb, cc, dd, x[i + 13], r[40], k[40]);
        dd = HH(dd, aa, bb, cc, x[i + 0], r[41], k[41]);
        cc = HH(cc, dd, aa, bb, x[i + 3], r[42], k[42]);
        bb = HH(bb, cc, dd, aa, x[i + 6], r[43], k[43]);
        aa = HH(aa, bb, cc, dd, x[i + 9], r[44], k[44]);
        dd = HH(dd, aa, bb, cc, x[i + 12], r[45], k[45]);
        cc = HH(cc, dd, aa, bb, x[i + 15], r[46], k[46]);
        bb = HH(bb, cc, dd, aa, x[i + 2], r[47], k[47]);

        aa = II(aa, bb, cc, dd, x[i + 0], r[48], k[48]);
        dd = II(dd, aa, bb, cc, x[i + 7], r[49], k[49]);
        cc = II(cc, dd, aa, bb, x[i + 14], r[50], k[50]);
        bb = II(bb, cc, dd, aa, x[i + 5], r[51], k[51]);
        aa = II(aa, bb, cc, dd, x[i + 12], r[52], k[52]);
        dd = II(dd, aa, bb, cc, x[i + 3], r[53], k[53]);
        cc = II(cc, dd, aa, bb, x[i + 10], r[54], k[54]);
        bb = II(bb, cc, dd, aa, x[i + 1], r[55], k[55]);
        aa = II(aa, bb, cc, dd, x[i + 8], r[56], k[56]);
        dd = II(dd, aa, bb, cc, x[i + 15], r[57], k[57]);
        cc = II(cc, dd, aa, bb, x[i + 6], r[58], k[58]);
        bb = II(bb, cc, dd, aa, x[i + 13], r[59], k[59]);
        aa = II(aa, bb, cc, dd, x[i + 4], r[60], k[60]);
        dd = II(dd, aa, bb, cc, x[i + 11], r[61], k[61]);
        cc = II(cc, dd, aa, bb, x[i + 2], r[62], k[62]);
        bb = II(bb, cc, dd, aa, x[i + 9], r[63], k[63]);

        a = addUnsigned(a, aa);
        b = addUnsigned(b, bb);
        c = addUnsigned(c, cc);
        d = addUnsigned(d, dd);
    }

    return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = md5;
} else {
    // 浏览器环境全局导出
    window.md5 = md5;
}