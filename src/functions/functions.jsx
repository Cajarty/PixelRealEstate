import { browserHistory } from 'react-router';
import _Base64 from 'js-base64';
var Base64 = _Base64.Base64;
var bigInt = require("big-integer");
var BigNumber = require('bignumber.js');

export const HexToString = (hexx) => {
    let hex = hexx.toString();//force conversion
    let str = '';
    for (let i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

export const StringToHex = (str) => {
    let arr = [];
    for (let i = 0, l = str.length; i < l; i ++) {
        let hex = Number(str.charCodeAt(i)).toString(16);
        arr.push(hex);
    }
    return arr.join('');
}

export const BigNumberToNumber = (big) => {
    return big.toNumber();
}

export const VisitPage = (path) => {
    browserHistory.push('/' + path);
}

export const ImageDataToBase64 = ( /*obj[0..999][0..4000]*/ data) => {
    let result = {};
    for (let i = 0; i < Object.keys(data).length; i++) {
        result[i] = [];
        for (let p = 0; p < result[i].length; p += 4) {
            let a = data[i][p];
            for (let char = p + 1; char < p + 3; char++) {
                a = a << 8;
                a |= data[i][char];
            }
            result[i].push(Base64.btoa(a));
        }
        return result;
    }
}

export const Base64ToImageData = ( /*obj[0..999][0..500]*/ data) => {   
    let result = {};

    for (let i = 0; i < Object.keys(data).length; i++) {
        result[i] = [];
        for (let p = 0; p < data[i].length; p++) {
            let tmp = [];
            let a = parseInt(Base64.atob(data[i][p]));
            tmp[2] = (a & 255 * 256 * 256) >> 16;
            tmp[1] = (a & 255 * 256) >> 8;
            tmp[0] = (a & 255);
            if (i == 0 && p == 1)
            result[i].push(tmp[2], tmp[1], tmp[0], 255);
        }
    }
    return result;
}

export const ContractDataToRGBAArray = (/*uint256[10]*/ contractDataArray) => {

    let result = [];
    let contractDataArraySize = 10;
    let pixelsPerBigInt = 10;
     
    for(let i = contractDataArraySize - 1; i >= 0; i--) {
        let uint256 = bigInt(contractDataArray[i].toString(10), 10); //Big ass number
        for (let j = 0; j < pixelsPerBigInt; j++) {
            result.unshift(255);
            result.unshift(uint256.and(255).toJSNumber());
            uint256 = uint256.shiftRight(8); 
            result.unshift(uint256.and(255).toJSNumber());
            uint256 = uint256.shiftRight(8);
            result.unshift(uint256.and(255).toJSNumber());
            uint256 = uint256.shiftRight(8);
        }
    }
    return result;
}

//Assumption: rgbArray is an array of rgb values for 100 pixels
export const RGBArrayToContractData = (rgbArray) => {
    let result = [];
    let counter = 0;
    for(let i = 0; i < 10; i++) { //Foreach uint256 in uint256[10]
        let innerResult = new bigInt("0", 10);
        for(let j = 0; j < 10; j++) { //Foreach 24 bits for the uint256
            let binary = RGBToBinary(rgbArray[counter++], rgbArray[counter++], rgbArray[counter++]);
            counter++;
            innerResult = innerResult.shiftLeft(24);
            innerResult = innerResult.or(binary);
        }
        result.push(new BigNumber(innerResult.toString(), 10));
    }
    return result;
}

export const RGBToBinary = (r, g, b) => {
    let v = r;
    v = v << 8;
    v = v | g;
    v = v << 8;
    v = v | b;
    return v;
}

export const BinaryToRGB = (value) => {
    let obj = { r: 16711680, g: 65280, b: 255 };
    obj.b = obj.b & value;
    obj.g = (obj.g & value) >> 8;
    obj.r = (obj.r & value) >> 16;
    return obj;
}