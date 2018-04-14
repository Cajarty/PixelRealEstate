import { browserHistory } from 'react-router';
import _Base64 from 'js-base64';
var Base64 = _Base64.Base64;
var bigInt = require("big-integer");
var BigNumber = require('bignumber.js');
var utf8 = require("utf8");

export const PAGES = {
    TOP: {query: 'html'},
    BROWSE: {query: '.lowerSegment.one'},
    CHANGE_LOG: {query: '.lowerSegment.two'},
    TRADE_LOG: {query: '.lowerSegment.three'},
};

export const ScrollTo = (page) => {
    let element = document.querySelector(page.query);
    if (element != null)
        element.scrollIntoView({behavior: "smooth", block: "start", inline: "start"});
}

export const TimeSince = (date, to = false) => {
    let seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (to)
        seconds = Math.abs(seconds);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

export const Clamp = (min, max, value) => {
    return Math.max(min, Math.min(max, value));
}

export const StringToBigInts = (string) => {
    let result = [];
    let innerResult = new bigInt("0", 10);
    for(let i = 0; i < 32; i++) {
      let binary = 32;
      if (i < string.length) {
        binary = string.charCodeAt(i);
      }
      innerResult = innerResult.shiftLeft(8);
      innerResult = innerResult.or(binary);
    }
    result.push(new BigNumber(innerResult.toString(), 10));
    innerResult = new bigInt("0", 10);
    for(let i = 32; i < 64; i++) {
      let binary = 32;
      if (i < string.length) {
        binary = string.charCodeAt(i);
      }
      innerResult = innerResult.shiftLeft(8);
      innerResult = innerResult.or(binary);
    }
    result.push(new BigNumber(innerResult.toString(), 10));
    return result;
  }

export const BigIntsToString = (bigInts) => {
    let result = [];
    bigInts.reverse();
    for(let i = 0; i < 2; i++) {
        let uint256 = new bigInt(bigInts[i].toString(10), 10);
        if (uint256 != 0) {
            for(let j = 0; j < 32; j++) {
                let ascii = uint256.and(255).toJSNumber();
                if (ascii != 0) {
                  result.push(String.fromCharCode(ascii));
                }
                uint256 = uint256.shiftRight(8); 
            }
        }
    }
    return result.reverse().join("");
  }

export const StringToHex = function(str) {
    str = utf8.encode(str);
    var hex = "";

    // remove \u0000 padding from either side
    str = str.replace(/^(?:\u0000)*/,'');
    str = str.split("").reverse().join("");
    str = str.replace(/^(?:\u0000)*/,'');
    str = str.split("").reverse().join("");

    for(var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        // if (code !== 0) {
        var n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
        // }
    }

    return "0x" + hex;
};

export const HexToString = function(hex) {
    //if (!isHexStrict(hex))
    //    throw new Error('The parameter "'+ hex +'" must be a valid HEX string.');

    var str = "";
    var code = 0;
    hex = hex.replace(/^0x/i,'');

    // remove 00 padding from either side
    hex = hex.replace(/^(?:00)*/,'');
    hex = hex.split("").reverse().join("");
    hex = hex.replace(/^(?:00)*/,'');
    hex = hex.split("").reverse().join("");

    var l = hex.length;

    for (var i=0; i < l; i+=2) {
        code = parseInt(hex.substr(i, 2), 16);
        // if (code !== 0) {
        str += String.fromCharCode(code);
        // }
    }

    return utf8.decode(str);
};

export const BigNumberToNumber = (big) => {
    return big.toNumber();
}

export const NumberToBigNumber = (num) => {
    return BigNumber(num);
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

export const calculateEarnings = (lastUpdate, maxEarnings) => {
    let now = new Date().getTime();
    let maxTime = (lastUpdate + (maxEarnings * 60)) * 1000;
    let current = Math.min(now, maxTime);
    return Math.floor((current - (lastUpdate * 1000)) / 60000);
}