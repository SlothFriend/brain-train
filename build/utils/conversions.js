"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.digitToTwoBits = exports.halfByteToDigit = exports.digitToHalfByte = void 0;
/**
 * Takes a positive, single-digit number and returns the half-byte (nibble) representation
 * as a boolean array. Pads with zeros in the front to ensure 4 bits are represented.
 */
exports.digitToHalfByte = (n) => {
    let str = (n >>> 0).toString(2);
    if (str.length >= 4)
        str = str.substr(-4);
    else {
        while (str.length < 4) {
            str = '0' + str;
        }
    }
    return str.split('').map(s => s === '1');
};
exports.halfByteToDigit = (nibble) => {
    const str = nibble.map(x => x ? '1' : '0').join('');
    return parseInt(str, 2);
};
exports.digitToTwoBits = (n) => {
    let str = (n >>> 0).toString(2);
    if (str.length >= 2)
        str = str.substr(-2);
    else {
        while (str.length < 2) {
            str = '0' + str;
        }
    }
    return str.split('').map(s => s === '1');
};
