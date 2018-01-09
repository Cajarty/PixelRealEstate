import { browserHistory } from 'react-router';
var bigInt = require("big-integer");
var BigNumber = require('bignumber.js');

export const VisitPage = (path) => {
    browserHistory.push('/' + path);
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