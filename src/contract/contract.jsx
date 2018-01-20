
// Import libraries we need.
import { default as Web3 } from 'web3';
import * as Const from '../const/const.jsx';
import * as Func from '../functions/functions.jsx';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import VirtualRealEstate from '../../build/contracts/VirtualRealEstate.json'


export const ERROR_TYPE = {
    success: 'success',
    warning: 'warning',
    error: 'error',
}
export const LISTENERS = {
    Error: 'error',
    Alert: 'alert',
}; 

export const EVENTS = { 
    PropertyColorUpdate: 'PropertyColorUpdate',
    PropertyBought: 'PropertyBought'
};

export class Contract {
    constructor() {
        this.listeners = {};

        this.accounts = null;
        this.account = null;
        this.VRE = contract(VirtualRealEstate);
        this.pixelsOwned = {};
        this.pixelsRented = {};
        this.pixelsForSale = {};
        this.pixelsForRent = {};

        this.propertyTradeLog = [];

        this.getAccountsInterval = null;

        this.events = {
            event: null,
            PropertyColorUpdate: {},
            PropertyBought: {},

        }
        
        this.setup();
        this.test();
    }

    setup() {
        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== 'undefined') {
            console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 VRE, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
                // Use Mist/MetaMask's provider
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
        }
        this.VRE.setProvider(window.web3.currentProvider);

        this.getAccounts();
        
        this.getAccountsInterval = setInterval(() => this.getAccounts(), 1000);
    }

    getAccounts() {
        window.web3.eth.getAccounts((err, accs) => {
            if (err != null) {
                this.sendResults({errorId: 1, errorType: ERROR_TYPE.Error, message: "There was an error fetching your accounts."}, [LISTENERS.Error]);
                return;
            }

            if (accs.length == 0) {
                this.sendResults({errorId: 0, errorType: ERROR_TYPE.Error, message: "Couldn't get any accounts! Make sure you're logged into Metamask."}, [LISTENERS.Error]);
                return;
            }

            this.sendResults({removeErrors: [0, 1], message: ''}, [LISTENERS.Error]);

            this.accounts = accs;
            this.account = this.accounts[0];
        });
    }

    setupEvents() {
        this.VRE.deployed().then((instance) => {
            this.events.event = instance.allEvents({fromBlock: 0, toBlock: 'latest'});
            this.events.event.watch((error, result) => {
                if (error) {
                    console.info(result, error);
                } else {
                    this.sendEvent(result.event, result);
                }
            });
        }).catch((c) => {
            console.info(c);
        });
    }

    toID(x, y) {
        return y * Const.PROPERTIES_WIDTH + x;
    }

    fromID(id) {
        let obj = {x: 0, y: 0};
        obj.x = id % Const.PROPERTIES_WIDTH;
        obj.y = Math.floor(id / 100);
        return obj;
    }

    buyProperty(x, y, price) {
        this.VRE.deployed().then((i) => {
            return i.buyProperty(this.toID(x, y), { value: price, from: this.account });
        }).then(() => {
            this.sendResults({result: true, message: "Property " + x + "x" + y + " purchase complete."});
        }).catch((e) => {
            console.info(e);
            this.sendResults(false, "Unable to purchase property " + x + "x" + y + ".");
        });
    }

    sellProperty(x, y, price) {
        this.VRE.deployed().then((i) => {
            return i.listforSale(this.toID(x, y), {from: this.account });
        }).then(() => {
            console.info({result: true, message: "Pixel " + x + "x" + y + " purchase complete."});
        }).catch((e) => {
            console.log(e);
        });
    }

    //array of 2 32 bytes of string
    setHoverText(x, y, text) {
        let strs = [];
        strs.push(text.slice(0, 32));
        strs.push(text.slice(33, 64));
        this.VRE.deployed().then((i) => {
            return i.setHoverText(this.toID(x, y), strs, {from: this.account });
        }).then(function() {
            console.info("Pixel " + x + "x" + y + " update complete.");
        }).catch((e) => {
            console.log(e);
        });
    }

    //array of 2 32 bytes
    setLink(x, y, text) {
        let strs = [];
        strs.push(text.slice(0, 32));
        strs.push(text.slice(33, 64));
        this.VRE.deployed().then((i) => {
            return i.setLink(this.toID(x, y), strs, {from: this.account });
        }).then(function() {
            console.info("Pixel " + x + "x" + y + " update complete.");
        }).catch((e) => {
            console.log(e);
        });
    }

    getForSalePrice(x, y) {
        this.VRE.deployed().then((i) => {
            return i.getForSalePrice.call(this.toID(x, y)).then((r) => {
                return r;
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getForRentPrice(x, y) {
        this.VRE.deployed().then((i) => {
            return i.getForRentPrice.call(this.toID(x, y)).then((r) => {
                return r;
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getHoverText(x, y) {
        this.VRE.deployed().then((i) => {
            return i.getHoverText.call(this.toID(x, y)).then((r) => {
                return r;
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getLink(x, y) {
        this.VRE.deployed().then((i) => {
            return i.getLink.call(this.toID(x, y)).then((r) => {
                return r;
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getPropertyColorsOfRow(x, row, callback) {
        this.VRE.deployed().then((i) => {
            return i.getPropertyColorsOfRow.call(x, row).then((r) => {
                callback(x, row, Func.ContractDataToRGBAArray(r));
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getPropertyColors(x, y, callback) {
        this.VRE.deployed().then((i) => {
            return i.getPropertyColors.call(this.toID(x, y)).then((r) => {
                callback(x, y, Func.ContractDataToRGBAArray(r));
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getPropertyData(x, y, callback) {
        //returns address, price, renter, rent length, rentedUntil, rentPrice
        this.VRE.deployed().then((i) => {
            i.getPropertyData.call(this.toID(x, y)).then((r) => {
                return callback(r);
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    setColors(x, y, data) {
        this.VRE.deployed().then((i) => {
            return i.setColors(this.toID(x, y), Func.RGBArrayToContractData(data), {from: this.account });
        }).then(() => {
            this.sendResults(true, "Property " + x + "x" + y + " pixels changed.");
            this.sendEvent(EVENTS.PropertyColorUpdate, {args: {x: x, y: y, colorsRGB: data}});
        }).catch((e) => {
            console.info(e);
            this.sendResults(false, "Error uploading pixels.");
        });
    }

    rentProperty(x, y, price) {
        this.VRE.deployed().then((i) => {
            return i.setLink(this.toID(x, y), {value: price, from: this.account });
        }).then(function() {
            console.info("Pixel " + x + "x" + y + " update complete.");
        }).catch((e) => {
            console.log(e);
        });
    }

    stopRenting(x, y) {
        this.VRE.deployed().then((i) => {
            return i.setLink(this.toID(x, y), {from: this.account });
        }).then(function() {
            console.info("Pixel " + x + "x" + y + " update complete.");
        }).catch((e) => {
            console.log(e);
        });
    }

    /*
    duration == seconds
    */
    listForRent(x, y, price, duration) {

    }

    /*
    Stop renting/selling a pixel you own.
    */
    delist(x, y, delistFromSale, delistFromRent) {

    }

    /*
    Subscriber functions for gnereal updates.
    Events that are being used:
        Alerts
    */
    listenForResults(key, callback) {
        this.listeners[key] = callback;
    }

    stopListeningForResults(key) {
        delete this.listeners[key];
    }

    sendResults(result, include = [], exclude = []) {
        Object.keys(this.listeners).map((i) => {
            for (let b = 0; b < Math.max(exclude.length, include.length); b++) {
                if (include.length > b && include[b] !== i)
                    return;
                if (exclude.length > b && exclude[b] === i)
                    return;
            }
            this.listeners[i](result);
        });
    }

    /*
    Subscriber functions for function call returns from events fired on the 
    contract.
    */
    listenForEvent(event, key, callback) {
        this.events[event][key] = callback;
    }

    stopListeningForEvent(event, key) {
        delete this.events[event][key];
    }

    sendEvent(event, result) {
        Object.keys(this.events[event]).map((i) => {
            this.events[event][i](result);
        });
    }

    test() {
       // this.buyProperty(46, 20, 10000000000000000);
    }
}
/*
class Test {
    constructor(test, expected) {
        this.test = test;
        this.expected = expected;
    }

    assert() {
        if (this.test !== this.expected)
            throw new Error('Test Failed!');
        return this.test + ' === ' + this.expected;
    }
}*/

export const ctr = new Contract();