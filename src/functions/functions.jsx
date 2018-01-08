import { browserHistory } from 'react-router';
var bigInt = require("big-integer");

export const VisitPage = (path) => {
    browserHistory.push('/' + path);
}

export const ContractDataToRGBAArray = (/*uint256[10]*/ contractDataArray) => {
    let result = [];
    let contractDataArraySize = 10;
    let pixelsPerBigInt = 10;
     
    for(let i = 0; i < contractDataArraySize; i++) {
        let uint256 = contractDataArray[i]; //Big ass number
        for(let j = 0; j < pixelsPerBigInt; j++) {
            //data moved to the right enough to push all but the last rgb values off it
            let maximumByte = bigInt("FF", 32);
            let bitwiseOffset = (24 * (pixelsPerBigInt - j + 1));
            let mask = maximumByte >> bitwiseOffset;

            let binary = uint256 >> bitwiseOffset;

            let rgbData = BinaryToRGB(mask & binary);
            result.push(rgbData.r);
            result.push(rgbData.g);
            result.push(rgbData.b);
            result.push(0);
        }
    }

    return result;
}

//Assumption: rgbArray is an array of rgb values for 100 pixels
export const RGBArrayToContractData = (rgbArray) => {
    let result = [];
    for(let i = 0; i < 10; i++) {
        let innerResult = 0;
        for(let j = 0; j < 10; j++) {
            let binary = RGBToBinary(rgbArray[i * 30 + j * 3], rgbArray[i * 30 + j * 3 + 1], rgbArray[i * 30 + j * 3 + 2]);
            if (j != 0)
                innerResult = innerResult << 24;
            innerResult = innerResult | binary;
        }
        result.push(innerResult);
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
