
import * as EVENTS from '../const/events';
import {ctr, Contract, LISTENERS} from './contract.jsx';
import {ax, Axios} from '../network/Axios.jsx';
import * as Func from '../functions/functions.jsx';
import * as Assets from '../const/assets';
import * as Struct from '../const/structs';
import {GFD, GlobalState} from '../functions/GlobalState';

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

        this.evHndl = {
            [EVENTS.PropertyColorUpdate]: null,
            [EVENTS.PropertyBought]: null,
            [EVENTS.SetUserHoverText]: null,
            [EVENTS.SetUserSetLink]: null,
            [EVENTS.PropertySetForSale]: null,
            [EVENTS.DelistProperty]: null,
            [EVENTS.SetPropertyPublic]: null,
            [EVENTS.SetPropertyPrivate]: null,
            [EVENTS.Bid]: null,
        };
    }

    destructor() {
        Object.keys(this.evHndl).map((key, i) => {
            this.evHndl[key].stopWatching();
        });
    }

    setupEvents() {

        ctr.watchEventLogs(EVENTS.PropertyColorUpdate, {}, (handle) => {
            this.evHndl[EVENTS.PropertyColorUpdate] = handle;
            this.evHndl[EVENTS.PropertyColorUpdate].watch((error, log) => {
                let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                let colors = Func.ContractDataToRGBAArray(log.args.colors);
                this.forceUpdatePropertyData(id.x, id.y);
                this.insertPropertyImage(id.x, id.y, colors);
            });
        });

        ctr.watchEventLogs(EVENTS.PropertyBought, {}, (handle) => {
            this.evHndl[EVENTS.PropertyBought] = handle;
            this.evHndl[EVENTS.PropertyBought].watch((error, log) => {
                let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                this.updateProperty(id.x, id.y, {owner: log.args.newOwner});
                this.organizeProperty(id.x, id.y);
            });
        });

        //not really required to listen to
        // ctr.watchEventLogs(EVENTS.SetUserHoverText, {}, (handle) => {
        //     this.evHndl[EVENTS.SetUserHoverText] = handle;
        //     this.evHndl[EVENTS.SetUserHoverText].watch((error, log) => {
        //         console.error('No Event handler for ', EVENTS.SetUserHoverText);
        //     });
        // });

        // ctr.watchEventLogs(EVENTS.SetUserSetLink, {}, (handle) => {
        //     this.evHndl[EVENTS.SetUserSetLink] = handle;
        //     this.evHndl[EVENTS.SetUserSetLink].watch((error, log) => {
        //         console.error('No Event handler for ', EVENTS.SetUserSetLink);
        //     });
        // });

        ctr.watchEventLogs(EVENTS.PropertySetForSale, {}, (handle) => {
            this.evHndl[EVENTS.PropertySetForSale] = handle;
            this.evHndl[EVENTS.PropertySetForSale].watch((error, log) => {
                let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                this.updateProperty(id.x, id.y, {isForSale: true});
                this.organizeProperty(id.x, id.y);
            });
        });

        ctr.watchEventLogs(EVENTS.DelistProperty, {}, (handle) => {
            this.evHndl[EVENTS.DelistProperty] = handle;
            this.evHndl[EVENTS.DelistProperty].watch((error, log) => {
                let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                this.updateProperty(id.x, id.y, {isForSale: false});
                this.organizeProperty(id.x, id.y);
            });
        });

        ctr.watchEventLogs(EVENTS.SetPropertyPublic, {}, (handle) => {
            this.evHndl[EVENTS.SetPropertyPublic] = handle;
            this.evHndl[EVENTS.SetPropertyPublic].watch((error, log) => {
                console.info(log);
                throw 'Need to update the correct data here.';
                let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                this.updateProperty(id.x, id.y, {isForSale: false});
                this.organizeProperty(id.x, id.y);
            });
        });

        ctr.watchEventLogs(EVENTS.SetPropertyPrivate, {}, (handle) => {
            this.evHndl[EVENTS.SetPropertyPrivate] = handle;
            this.evHndl[EVENTS.SetPropertyPrivate].watch((error, log) => {
                console.info(log);
                throw 'Need to update the correct data here.';
                let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                this.updateProperty(id.x, id.y, {isForSale: false});
                this.organizeProperty(id.x, id.y);
            });
        });

        ctr.watchEventLogs(EVENTS.Bid, {}, (handle) => {
            this.evHndl[EVENTS.Bid] = handle;
            this.evHndl[EVENTS.Bid].watch((error, log) => {
                let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                let bid = Func.BigNumberToNumber(log.args.bid);
                let timestamp = Func.BigNumberToNumber(log.args.timestamp);
                let x = id.x, y = id.y;
                if (this.bids[x] == null) 
                    this.bids[x] = {};
                if (this.bids[x][y] == null)
                    this.bids[x][y] = {};
                this.bids[x][y][timestamp] = bid;
            });
        });
    }

    init() {
        this.requestServerImage((imageResult) => {
            this.requestServerData((dataResult) => {
                this.setupEvents();
                GFD.setData('ServerDataManagerInit', 2);
                ctr.sendResults(LISTENERS.ServerDataManagerInit, {imageLoaded: imageResult, dataLoaded: dataResult});
            });
        });
    }

    initNoMetaMask() {
        this.requestServerImage((imageResult) => {
            this.requestServerData((dataResult) => {
                GFD.setData('ServerDataManagerInit', 1);
                ctr.sendResults(LISTENERS.ServerDataManagerInit, {imageLoaded: imageResult, dataLoaded: dataResult});
            });
        });
    }

    /*
    Returns true/false on success/fail of the load.
    */
    requestServerData(resultCallback) {
        ax.get('/getPropertyData', this.cancelDataRequestToken).then((result) => {
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
        ax.get('/getPixelData', this.cancelImageRequestToken).then((result) => {
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

    forceUpdatePropertyData(x, y, callback = () => {}) {
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
            callback(update);
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
    returns a property at a location.
    */
    getPropertyData(x, y) {
        if (this.allProperties[x] == null || this.allProperties[x][y] == null) {
            return Struct.PropertyData();
        }
        return this.allProperties[x][y];
    }

    /*
    returns a property at a location.
    */
    isPropertyLoaded(x, y) {
        return (this.allProperties[x] != null && this.allProperties[x][y] != null);
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
        return new Promise(resolve => {
            let list = [];
            if (GFD.getData('ServerDataManagerInit') < 1 && (objList == null || Object.keys(objList).length == 0)) {
                setTimeout(() => {
                    resolve(this.orderPropertyList(objList, compFunc));
                }, 1000);
            } else {
                let height = Object.keys(objList).length;
                let width = Object.keys(objList).length;
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        if (objList[x] != null && objList[x][y] != null) {
                            let i = 0;
                            for (; i < list.length; i++) {
                                if (compFunc(objList[x][y], list[i]))
                                    break;
                            }
                            list.splice(i, 0, objList[x][y]);
                        }
                    };
                };
                resolve(list);
            }
        });
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
        let block = 1000;
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
            }, 20);
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