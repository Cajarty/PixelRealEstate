
// Import libraries we need.
import { default as Web3 } from 'web3';
import * as Const from '../const/const.jsx';
import * as Func from '../functions/functions.jsx';
import { default as contract } from 'truffle-contract';
import {GFD, GlobalState} from '../functions/GlobalState';
import {SDM, ServerDataManager} from '../contract/ServerDataManager';

// Import our contract artifacts and turn them into usable abstractions.
import VirtualRealEstate from '../../build/contracts/VirtualRealEstate.json'


export const ERROR_TYPE = {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
}
export const LISTENERS = {
    Error: 'Error',
    Alert: 'Alert',
    ShowForSale: 'ShowForSale',
    ServerDataManagerInit: 'ServerDataManagerInit',
}; 

export const EVENTS = { 
    PropertyColorUpdate: 'PropertyColorUpdate',                     //(uint24 indexed property, uint256[10] colors, uint256 lastUpdate, address lastUpdaterPayee);
    PropertyColorUpdatePixel: 'PropertyColorUpdatePixel',           //(uint24 indexed property, uint8 row, uint24 rgb);

    SetUserHoverText: 'SetUserHoverText',                           //(address indexed user, bytes32[2] newHoverText);
    SetUserSetLink: 'SetUserSetLink',                               //(address indexed user, bytes32[2] newLink);

    PropertyBought: 'PropertyBought',                               //(uint24 indexed property,  address newOwner);
    PropertySetForSale: 'PropertySetForSale',                       //(uint24 indexed property, uint256 forSalePrice);
    DelistProperty: 'DelistProperty',                               //(uint24 indexed property);

    ListTradeOffer: 'ListTradeOffer',                               //(address indexed offerOwner, uint256 eth, uint256 pxl, bool isBuyingPxl);
    AcceptTradeOffer: 'AcceptTradeOffer',                           //(address indexed accepter, address indexed offerOwner);
    CancelTradeOffer: 'CancelTradeOffer',                           //(address indexed offerOwner);

    SetPropertyPublic: 'SetPropertyPublic',                         //(uint24 indexed property);
    SetPropertyPrivate: 'SetPropertyPrivate',                       //(uint24 indexed property, uint32 numHoursPrivate);

    Bid: 'Bid',                                                     //(uint24 indexed property, uint256 bid);
    AccountChange: 'AccountChange',                                 //(newaccount)  -  not a contract event.

    //token events    
    Transfer: 'Transfer',                                           //(address indexed _from, address indexed _to, uint256 _value);
    Approval: 'Approval',                                           //(address indexed _owner, address indexed _spender, uint256 _value);
};

export class Contract {
    constructor() {

        this.accounts = null;
        this.account = null;
        this.VRE = contract(VirtualRealEstate);

        this.propertyTradeLog = [];

        this.getAccountsInterval = null;

        this.events = {
            event: null,
        }
        
        Object.keys(EVENTS).map((index) => {
            this.events[index] = {};
        });

        this.listeners = {};
        Object.keys(LISTENERS).map((index) => {
            this.listeners[index] = {};
        });
        
        this.setup();
    }

    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------       SETUP & MISC       ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------

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
        this.setupEvents();
        
        this.getAccountsInterval = setInterval(() => this.getAccounts(), 1000);

        
    }

    getAccounts() {
        window.web3.eth.getAccounts((err, accs) => {
            if (err != null) {
                if (GFD.getData('advancedMode')) {
                    this.sendResults(LISTENERS.Error, {errorId: 1, errorType: ERROR_TYPE.Error, message: "In order to fully interact with the client, it is required to have the MetaMask.io web-plugin installed. MetaMask allows you to store your earnings securely in your own Ethereum lite-wallet. "});
                } else {
                    this.sendResults(LISTENERS.Error, {errorId: 1, errorType: ERROR_TYPE.Error, message: "The canvas is updating every 15 seconds. Get instant updates with https://metamask.io/ ."});
                }
                return;
            }

            if (accs.length == 0) {
                if (GFD.getData('advancedMode')) {
                    this.sendResults(LISTENERS.Error, {errorId: 0, errorType: ERROR_TYPE.Error, message: "Couldn't get any accounts! Make sure you're logged into Metamask."});
                }
                return;
            }

            this.sendResults(LISTENERS.Error, {removeErrors: [0, 1], message: ''});

            this.accounts = accs;
            if (this.account != this.accounts[0]) {
                this.account = this.accounts[0];
                this.sendEvent(EVENTS.AccountChange, this.accounts[0]);
            }
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
            SDM.init();
            this.listenForResults(LISTENERS.ServerDataManagerInit, 'contract', () => {
                this.stopListeningForResults(LISTENERS.ServerDataManagerInit, 'contract');
                this.events.event.get((error, result) => {
                    if (error) {
                        console.info(result, error);
                    } else {
                        for (let i = 0; i < result.length; i++)
                            this.sendEvent(result[i].event, result[i]);
                    }
                });
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
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------       SETUP & MISC       ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------



    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ----------------------------------         SETTERS         ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------

    buyProperty(x, y, eth, ppc, callback) {
        console.info(x, y, eth, ppc);
        this.VRE.deployed().then((i) => {
            if (eth == 0)
                return i.buyPropertyInPPC(this.toID(x, y), ppc, {from: this.account });
            else if (ppc == 0)
                return i.buyPropertyInETH(this.toID(x, y), { value: eth, from: this.account });
            else 
                return i.buyProperty(this.toID(x, y), ppc, {value: eth, from: this.account});
        }).then(() => {
            callback(true);
            this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + x + "x" + y + " purchase complete."});
        }).catch((e) => {
            callback(false);
            console.info(e);
            this.sendResults(LISTENERS.Error, {result: false, message: "Unable to purchase property " + x + "x" + y + "."});
        });
    }

    sellProperty(x, y, price) {
        this.VRE.deployed().then((i) => {
            return i.listForSale(this.toID(parseInt(x), parseInt(y)), price, {from: this.account });
        }).then(() => {
            this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + x + "x" + y + " listed for sale."});
        }).catch((e) => {
            console.log(e);
            this.sendResults(LISTENERS.Error, {result: false, message: "Unable to put property " + x + "x" + y + " on market."});
        });
    }

    delistProperty(x, y, callback) {
        this.VRE.deployed().then((i) => {
            return i.delist(this.toID(parseInt(x), parseInt(y)), {from: this.account });
        }).then(() => {
            callback(true);
            this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + x + "x" + y + " listed for sale."});
        }).catch((e) => {
            console.log(e);
            callback(false);
            this.sendResults(LISTENERS.Error, {result: false, message: "Unable to put property " + x + "x" + y + " on market."});
        });
    }

    setPropertyMode(x, y, isPrivate, callback, minutesPrivate = 0) {
        this.VRE.deployed().then((i) => {
            return i.setPropertyMode(this.toID(x, y), isPrivate, minutesPrivate, {from: this.account }).then((r) => {
                return callback(r);
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    //array of 2 32 bytes of string
    setHoverText(text) {
        this.VRE.deployed().then((i) => {
            return i.setHoverText(Func.StringToBigInts(text), {from: this.account});
        }).then(function() {
            console.info("Hover text set!");
        }).catch((e) => {
            console.log(e);
        });
    }

    //array of 2 32 bytes
    setLink(text) {
        this.VRE.deployed().then((i) => {
            return i.setLink(Func.StringToBigInts(text), {from: this.account });
        }).then(function() {
            console.info("Property link updated!");
        }).catch((e) => {
            console.log(e);
        });
    }

    transferProperty(x, y, newOwner, callback) { 
        this.VRE.deployed().then((i) => {
            return i.transferProperty(this.toID(parseInt(x), parseInt(y)), newOwner, {from: this.account}).then((r) => {
                return callback(r);
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    makeBid(x, y, bid) {
        this.VRE.deployed().then((i) => {
            return i.makeBid(this.toID(x, y), bid, {from: this.account });
        }).then(() => {
            this.sendResults(LISTENERS.Alert, {result: true, message: "Bid for " + x + "x" + y + " sent to owner."});
        }).catch((e) => {
            console.info(e);
            this.sendResults(LISTENERS.Error, {result: false, message: "Error placing bid."});
        });
    }

    setColors(x, y, data, PPT) {
        this.VRE.deployed().then((i) => {
            return i.setColors(this.toID(x, y), Func.RGBArrayToContractData(data), PPT, {from: this.account });
        }).then(() => {
            this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + x + "x" + y + " pixels changed."});
        }).catch((e) => {
            console.info(e);
            this.sendResults(LISTENERS.Error, {result: false, message: "Error uploading pixels."});
        });
    }

    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ----------------------------------         SETTERS         ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------








    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ----------------------------------         GETTERS         ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    getBalance(callback) {
        this.VRE.deployed().then((i) => {
            i.balanceOf(this.account, { from: this.account }).then((r) => {
                callback(Func.BigNumberToNumber(r));
            });
        }).catch((e) => {
            console.info(e);
            this.sendResults(LISTENERS.Error, {result: false, message: "Unable to retrieve PPC balance."});
        });
    }

    getSystemSalePrices(callback) {
        this.VRE.deployed().then((i) => {
            return i.getSystemSalePrices.call().then((r) => {
                return callback(r);
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getForSalePrices(x, y, callback) {
        this.VRE.deployed().then((i) => {
            return i.getForSalePrices.call(this.toID(x, y)).then((r) => {
                return callback(r);
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

    getHoverText(address, callback) {
        this.VRE.deployed().then((i) => {
            return i.getHoverText.call(address).then((r) => {
                return callback(Func.BigIntsToString(r));
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getLink(address, callback) {
        this.VRE.deployed().then((i) => {
            return i.getLink.call(address).then((r) => {
                return callback(Func.BigIntsToString(r));
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

    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ----------------------------------         GETTERS         ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------



    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ----------------------------------         EVENTS          ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------

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
    listenForResults(listener, key, callback) {
        this.listeners[listener][key] = callback;
    }

    stopListeningForResults(listener, key) {
        delete this.listeners[listener][key];
    }

    sendResults(listener, result) {
        Object.keys(this.listeners[listener]).map((i) => {
            this.listeners[listener][i](result);
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
        console.info(event, result)
        Object.keys(this.events[event]).map((i) => {
            this.events[event][i](result);
        });
    }

    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ----------------------------------         EVENTS          ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
}

export const ctr = new Contract();