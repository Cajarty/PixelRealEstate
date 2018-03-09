import {ctr, Contract, EVENTS, LISTENERS} from './contract.jsx';
import Axios from '../network/Axios.jsx';
import * as Func from '../functions/functions.jsx';

export const Compares = {
    xAsc: { 
        label: 'X - Ascending',
        value: 'xAsc',
        func: (a,b) => {return a.x < b.x;}
    }, 
    xDesc: {
        label: 'X - Descending',
        value: 'xDesc',
        func: (a,b) => {return a.x > b.x;}
    },
    yAsc: {
        label: 'Y - Ascending', 
        value: 'yAsc',
        func: (a,b) => {return a.y < b.y;}
    },
    yDesc: {
        label: 'Y - Descending',
        value: 'yDesc',
        func: (a,b) => {return a.y > b.y;}
    },
    priceAsc: {
        label: 'Price - Ascending',
        value: 'priceAsc',
        func: (a,b) => {return a.PPCPrice < b.PPCPrice;}
    },
    priceDesc: {
        label: 'Price - Descending',
        value: 'priceDesc',
        func: (a,b) => {return a.PPCPrice > b.PPCPrice;}
    },
};

export class ServerDataManager {
    constructor() {
        //pixel data
        this.pixelData = [];

        //stored data
        this.allProperties = {};
        this.forSaleProperties = {};
        this.ownedProperties = {};
        this.bids = {};

        //for network requests
        this.cancelDataRequestToken = null;
        this.cancelImageRequestToken = null;
    }

    destructor() {
        ctr.stopListeningForEvent(EVENTS.PropertyColorUpdate, 'SDM-PropertyColorUpdate');
        ctr.stopListeningForEvent(EVENTS.PropertyColorUpdatePixel, 'SDM-PropertyColorUpdatePixel');
        ctr.stopListeningForEvent(EVENTS.PropertyBought, 'SDM-PropertyBought');
        ctr.stopListeningForEvent(EVENTS.SetUserHoverText, 'SDM-SetUserHoverText');
        ctr.stopListeningForEvent(EVENTS.SetUserSetLink, 'SDM-SetUserSetLink');
        ctr.stopListeningForEvent(EVENTS.PropertySetForSale, 'SDM-PropertySetForSale');
        ctr.stopListeningForEvent(EVENTS.DelistProperty, 'SDM-DelistProperty');
        ctr.stopListeningForEvent(EVENTS.ListTradeOffer, 'SDM-ListTradeOffer');
        ctr.stopListeningForEvent(EVENTS.AcceptTradeOffer, 'SDM-AcceptTradeOffer');
        ctr.stopListeningForEvent(EVENTS.CancelTradeOffer, 'SDM-CancelTradeOffer');
        ctr.stopListeningForEvent(EVENTS.SetPropertyPublic, 'SDM-SetPropertyPublic');
        ctr.stopListeningForEvent(EVENTS.SetPropertyPrivate, 'SDM-SetPropertyPrivate');
        ctr.stopListeningForEvent(EVENTS.Bid, 'SDM-Bid');
    }

    setupEvents() {
        ctr.listenForEvent(EVENTS.PropertyColorUpdate, 'SDM-PropertyColorUpdate', (data) => {
            let xy = {x: 0, y: 0};
            if (data.args.x == null || data.args.y == null)
                xy = ctr.fromID(Func.BigNumberToNumber(data.args.property));
            else {
                xy.x = data.args.x;
                xy.y = data.args.y;
            }

            this.forceUpdatePropertyData(xy.x, xy.y);

            if (data.args.colorsRGB == null)
                this.insertPropertyImage(xy.x, xy.y, Func.ContractDataToRGBAArray(data.args.colors));
            else
                this.insertPropertyImage(xy.x, xy.y, data.args.colorsRGB);
        });

        ctr.listenForEvent(EVENTS.PropertyColorUpdatePixel, 'SDM-PropertyColorUpdatePixel', (data) => {
            this.insertProperty(data.args);
            this.organizeProperty(data.args);
        });
        ctr.listenForEvent(EVENTS.PropertyBought, 'SDM-PropertyBought', (data) => {
            let pos = ctr.fromID(Func.BigNumberToNumber(data.args.property));
            this.updateProperty(pos.x, pos.y, {owner: data.args.newOwner});
            this.organizeProperty(pos.x, pos.y);
        });
        ctr.listenForEvent(EVENTS.SetUserHoverText, 'SDM-SetUserHoverText', (data) => {
        });
        ctr.listenForEvent(EVENTS.SetUserSetLink, 'SDM-SetUserSetLink', (data) => {
        });
        ctr.listenForEvent(EVENTS.PropertySetForSale, 'SDM-PropertySetForSale', (data) => {
            let pos = ctr.fromID(Func.BigNumberToNumber(data.args.property));
            this.updateProperty(pos.x, pos.y, {isForSale: true});
            this.organizeProperty(pos.x, pos.y);
        });
        ctr.listenForEvent(EVENTS.DelistProperty, 'SDM-DelistProperty', (data) => {
            let pos = ctr.fromID(Func.BigNumberToNumber(data.args.property));
            this.updateProperty(pos.x, pos.y, {isForSale: false});
            this.organizeProperty(pos.x, pos.y);
        });
        ctr.listenForEvent(EVENTS.ListTradeOffer, 'SDM-ListTradeOffer', (data) => {
        });
        ctr.listenForEvent(EVENTS.AcceptTradeOffer, 'SDM-AcceptTradeOffer', (data) => {
        });
        ctr.listenForEvent(EVENTS.CancelTradeOffer, 'SDM-CancelTradeOffer', (data) => {
        });
        ctr.listenForEvent(EVENTS.SetPropertyPublic, 'SDM-SetPropertyPublic', (data) => {
            this.insertProperty(data.args);
            this.organizeProperty(data.args);
        });
        ctr.listenForEvent(EVENTS.SetPropertyPrivate, 'SDM-SetPropertyPrivate', (data) => {
            this.insertProperty(data.args);
            this.organizeProperty(data.args);
        });
        ctr.listenForEvent(EVENTS.Bid, 'SDM-Bid', (data) => {
            let bid = Func.BigNumberToNumber(data.args.bid);
            let xy = ctr.fromID(Func.BigNumberToNumber(data.args.property));
            //let xy = ctr.fromID(Func.BigNumberToNumber(data.args.property));
            let x = xy.x, y = xy.y;
            console.info(bid, x, y);
            if (this.bids[x] == null) 
                this.bids[x] = {};
            if (this.bids[x][y] == null)
                this.bids[x][y] = {};
            this.bids[x][y][Math.floor(new Date().getTime() / 1000)] = bid;//change this to propert timestamp
        });
    }

    init() {
        this.requestServerImage((imageResult) => {
            this.requestServerData((dataResult) => {
                this.setupEvents();
                ctr.sendResults(LISTENERS.ServerDataManagerInit, {imageLoaded: imageResult, dataLoaded: dataResult});
            });
        });
    }

    /*
    Returns true/false on success/fail of the load.
    */
    requestServerData(resultCallback) {
        Axios.getInstance().get('/getPropertyData', this.cancelDataRequestToken).then((result) => {
            if (result.status == 200 && typeof result.data === 'object') {
                this.allProperties = result.data;
                this.organizeAllProperties();
                resultCallback(true);
            } else {
                resultCallback(false);
            }
        });
    }

    requestServerImage(resultCallback) {
        Axios.getInstance().get('/getPixelData', this.cancelImageRequestToken).then((result) => {
            if (result.status == 200) {
                this.pixelData = result.data;
                resultCallback(true);
            } else {
                resultCallback(false);
            }
        });
    }

    insertPropertyImage(xx, yy, RGBArray) {
        let counter = 0;
        for (let y = yy * 10; y < (yy + 1) * 10; y++)
            for (let x = xx * 10; x < (xx + 1) * 10; x++)
                for (let i = 0; i < 4; i++)
                    this.pixelData[y][x * 4 + i] = RGBArray[counter++];
    }

    forceUpdatePropertyData(x, y) {
        ctr.getPropertyData(x, y, (data) => {
            let ethp = Func.BigNumberToNumber(data[1]);
            let ppcp = Func.BigNumberToNumber(data[2]);
            let update = {
                owner: data[0],
                isForSale: ppcp != 0,
                ETHPrice: ethp,
                PPCPrice: ppcp,
                lastUpdate: Func.BigNumberToNumber(data[3]),
                isInPrivate: data[4],
            };
            this.updateProperty(x, y, update);
        });
    }

    /*
    Resorts the allproperties into other lists for quick access.
    Usually only used when first fetching the data because updates
    can be applied one by one.
    */
    organizeAllProperties() {
        for (let x = 0; x < 100; x++) {
            if (this.allProperties[x] != null)
                for (let y = 0; y < 100; y++) {
                    if (this.allProperties[x][y] != null)
                        this.organizeProperty(x, y);
                }
        }
    }

    /*
    Updates the other data depending if it applies.
    */
    organizeProperty(x, y) {
        if (this.allProperties[x][y] == null)
            return;


        if (ctr.account === this.allProperties[x][y].owner) {
            if (this.ownedProperties[x] == null)
                this.ownedProperties[x] = {};
            this.ownedProperties[x][y] = this.allProperties[x][y];
        } else {
            if (this.ownedProperties[x] != null && this.ownedProperties[x][y] != null) {
                delete this.ownedProperties[x][y];
            }
        }

        if (this.allProperties[x][y].isForSale) {
            if (this.forSaleProperties[x] == null)
                this.forSaleProperties[x] = {};
            this.forSaleProperties[x][y] = this.allProperties[x][y];
        } else {
            if (this.forSaleProperties[x] != null && this.forSaleProperties[x][y] != null) {
                delete this.forSaleProperties[x][y];
            }
        }
    }

    /*
    Updates a property at a location with the new passed in data.
    */
    updateProperty(x, y, update) {
        if (this.allProperties[x] == null) {
            this.allProperties[x] = {};
        }
        this.allProperties[x][y] = Object.assign({}, this.allProperties[x][y] || {}, update);
        this.organizeProperty(x, y);
    }

    /*
    Puts a new property or update on the main list into it.
    */
    insertProperty(x, y, property) {
        if (this.allProperties[x] == null)
            this.allProperties[x] = {};
        this.allProperties[x][y] = property;
    }

    orderPropertyList(objList, compFunc) {
        let list = [];
        Object.keys(objList).map(x => {
            Object.keys(objList[x]).map(y => {
                let i = 0;
                for (; i < list.length; i++) {
                    if (compFunc(objList[x][y], list[i]))
                        break;
                }
                list.splice(i, 0, objList[x][y]);
            });
        });
        return list;
    }

    partialOrderPropertyListByIndex(sortedArray, objArr, startIndex, endIndex, compFunc) {
        let list = sortedArray;
        for (let xy = startIndex; xy < endIndex && xy < objArr.length; xy++) {
            let i = 0;
            for (; i < list.length; i++) {
                if (compFunc(objArr[xy], list[i]))
                    break;
            }
            list.splice(i, 0, objArr[xy]);
        };
        return list;
    }

    orderPropertyListAsync(objList, compFunc) {
        let index = 0;
        let block = 100;
        let sortedArray = [];

        let objArr = [];

        Object.keys(objList).map(x => {
            Object.keys(objList[x]).map(y => {
                objArr.push(objList[x][y]);
            });
        });

        let repromise = (res, rej) => {
            setTimeout(() => {
                sortedArray = this.partialOrderPropertyListByIndex(sortedArray, objArr, index, index + block, compFunc);
                index += block;
                if (index < objArr.length)
                    res({promise: new Promise(repromise), data: sortedArray});
                else 
                    res({promise: null, data: sortedArray});
            }, 10);
        }

        return new Promise(repromise);
    }

    getPropertyImage(xx, yy) {
        let data = [];
        for (let y = yy * 10; y < (yy + 1) * 10; y++)
            for (let x = xx * 10; x < (xx + 1) * 10; x++)
                for (let i = 0; i < 4; i++) {
                    data.push(this.pixelData[y][x * 4 + i]);
                }
        return data;
    }
}

export const SDM = new ServerDataManager();