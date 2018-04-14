
// Import libraries we need.
import { default as Web3 } from 'web3';
import * as Const from '../const/const.jsx';
import * as Func from '../functions/functions.jsx';
import sigUtil from 'eth-sig-util';
import * as EVENTS from '../const/events';
import { default as contract } from 'truffle-contract';
import {GFD, GlobalState} from '../functions/GlobalState';
import {SDM, ServerDataManager} from '../contract/ServerDataManager';

// Import our contract artifacts and turn them into usable abstractions.
import VirtualRealEstate from '../../build/contracts/VirtualRealEstate.json'
import PXLProperty from '../../build/contracts/PXLProperty.json'
import Verifier from '../../build/contracts/Verifier.json'


export const ERROR_TYPE = {
    Success: 'green',
    Warning: 'orange',
    Error: 'red',
}
export const LISTENERS = {
    Error: 'Error',
    Alert: 'Alert',
    ShowForSale: 'ShowForSale',
    ServerDataManagerInit: 'ServerDataManagerInit',
}; 

export class Contract {
    constructor() {

        this.accounts = null;
        this.account = null;
        this.VRE = contract(VirtualRealEstate);
        this.PXLPP = contract(PXLProperty);
        this.Verify = contract(Verifier);

        this.VREInstance = null;
        this.PXLPPInstance = null;
        this.VerifyInstance = null;

        this.propertyTradeLog = [];

        this.getAccountsInterval = null;
        this.setupRetryInterval = null;

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
        let success = () => {
            if (typeof web3 !== 'undefined') {
                window.web3 = new Web3(window.web3.currentProvider);
                this.VRE.setProvider(window.web3.currentProvider);
                this.PXLPP.setProvider(window.web3.currentProvider);


                this.updateNetwork((id) => {
                    if (id === Const.NETWORK_RINKEBY) {
                        this.getAccounts();
        
                        this.break = false;
            
                        this.PXLPP.deployed().then((PXLPPInstance) => {
                            this.VRE.deployed().then((VREInstance) => {
                                this.VREInstance = VREInstance;
                                this.PXLPPInstance = PXLPPInstance;
                                SDM.init();
                            });
                        });

                        this.getAccountsInterval = setInterval(() => this.getAccounts(), 1000);
                        GFD.setData('noMetaMask', false);
                    } else {
                        SDM.initNoMetaMask();
                        GFD.setData('noMetaMask', false);
                    }
                })
            }
        }

        if (typeof web3 !== 'undefined') {
            success();
        } else {
            GFD.setData('noMetaMask', true);
            SDM.initNoMetaMask();
        }
    }

    getAccounts() {
        if (GFD.getData('noMetaMask'))
            return;
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
                    this.sendResults(LISTENERS.Error, {errorId: 0, errorType: ERROR_TYPE.Error, message: "Couldn't retrieve any accounts! Make sure you're logged into Metamask."});
                }
                GFD.setData('noAccount', true);
                return;
            }

            GFD.setData('noAccount', false);
            this.sendResults(LISTENERS.Error, {removeErrors: [0, 1], message: ''});

            this.accounts = accs;
            if (this.account !== this.accounts[0].toLowerCase()) {
                this.account = this.accounts[0].toLowerCase();
                this.sendEvent(EVENTS.AccountChange, this.account);
            }
        });
    }

    /*
    Requests all events of event type EVENT.
    */
    getEventLogs(event, params = {}, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_RINKEBY)
            return;

        let filter = {fromBlock: 'latest', toBlock: 'latest'};

        window.web3.eth.getBlock('latest').then((r) => {
            filter.fromBlock = r.number - 1000;

            // VRE DApp Events
            this.VRE.deployed().then((i) => {
                switch(event) {
                    case EVENTS.PropertyBought:
                        return i.PropertyBought(params, filter).get(callback);
                    case EVENTS.PropertyColorUpdate:
                        return i.PropertyColorUpdate(params, filter).get(callback);
                    case EVENTS.SetUserHoverText:
                        return i.SetUserHoverText(params, filter).get(callback);
                    case EVENTS.SetUserSetLink:
                        return i.SetUserSetLink(params, filter).get(callback);
                    case EVENTS.PropertySetForSale:
                        return i.PropertySetForSale(params, filter).get(callback);
                    case EVENTS.DelistProperty:
                        return i.DelistProperty(params, filter).get(callback);
                    case EVENTS.SetPropertyPublic:
                        return i.SetPropertyPublic(params, filter).get(callback);
                    case EVENTS.SetPropertyPrivate:
                        return i.SetPropertyPrivate(params, filter).get(callback);
                    case EVENTS.Bid:
                        return i.Bid(params, filter).get(callback);
                }
            });

            // PXL ERC20 Events
            this.PXLPP.deployed().then((i) => {
                switch(event) {
                    case EVENTS.Transfer:
                        return i.Transfer(params, filter).get(callback);
                    case EVENTS.Approval:
                        return i.Approval(params, filter).get(callback);
                }
            });
        });
    }

    /*
    Requests all events of event type EVENT.
    */
    watchEventLogs(event, params, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_RINKEBY)
            return;

        let filter = {fromBlock: 'latest', toBlock: 'latest'};

        window.web3.eth.getBlock('latest').then((r) => {
            filter.fromBlock = r.number - 1000;

            // VRE DApp Events
            this.VRE.deployed().then((i) => {
                switch(event) {
                    case EVENTS.PropertyBought:
                        return callback(i.PropertyBought(params, filter));
                    case EVENTS.PropertyColorUpdate:
                        return callback( i.PropertyColorUpdate(params, filter));
                    case EVENTS.SetUserHoverText:
                        return callback( i.SetUserHoverText(params, filter));
                    case EVENTS.SetUserSetLink:
                        return callback( i.SetUserSetLink(params, filter));
                    case EVENTS.PropertySetForSale:
                        return callback( i.PropertySetForSale(params, filter));
                    case EVENTS.DelistProperty:
                        return callback( i.DelistProperty(params, filter));
                    case EVENTS.SetPropertyPublic:
                        return callback( i.SetPropertyPublic(params, filter));
                    case EVENTS.SetPropertyPrivate:
                        return callback( i.SetPropertyPrivate(params, filter));
                    case EVENTS.Bid:
                        return callback( i.Bid(params, filter));
                }
            });

            // PXL ERC20 Events
            this.PXLPP.deployed().then((i) => {
                switch(event) {
                    case EVENTS.Transfer:
                        return callback( i.Transfer(params, filter));
                    case EVENTS.Approval:
                        return callback( i.Approval(params, filter));
                }
            });
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

    getVREInstance() {
        if (this.VREInstance)
            return new Promise((res, rej) => {res(this.VREInstance);});
        else
            return this.VRE.deployed();
    }

    getPXLPPInstance() {
        if (this.PXLPPInstance)
            return new Promise((res, rej) => {res(this.PXLPPInstance);});
        else
            return this.PXLPP.deployed();
    }

    getVerifyInstance() {
        if (this.VerifyInstance)
            return new Promise((res, rej) => {res(this.VerifyInstance);});
        else
            return this.Verify.deployed();
    }

    /*
        
        callback:
            bool: isValid,
            string: response message,
            string: signature,
    */
    sign(params, signer, callback) {
        window.web3.currentProvider.sendAsync({
            method: 'eth_signTypedData',
            params: [params, signer],
            from: signer,
        }, (err, result) => {
            if (err) {
                console.info(err);
                this.sendResults(LISTENERS.Alert, {result: false, message: "Unable to sign message with this wallet."});
                return callback(false, "Unable to sign message with this wallet.", null);
            }
            if (this.verify(params, result.result, signer))
                callback(true, 'Message signed successfully', result.result);
            else
                callback(false, "Unable to sign message with this wallet.", null);
        })
    }

    verify(params, signature, signer) {
        const recovered = sigUtil.recoverTypedSignature({
            data: params,
            sig: signature
        })
        return recovered === signer;
    }

    updateNetwork(callback = () => {}) {
        window.web3.eth.net.getId().then((netId) => {
            switch (netId) {
              case 1:
                GFD.setData('network', Const.NETWORK_MAIN);
                callback(Const.NETWORK_MAIN);
                break
              case 3:
                GFD.setData('network', Const.NETWORK_ROPSTEN);
                callback(Const.NETWORK_ROPSTEN);
                break
              case 4:
                GFD.setData('network', Const.NETWORK_RINKEBY);
                callback(Const.NETWORK_RINKEBY);
                break
              case 42:
                GFD.setData('network', Const.NETWORK_KOVAN);
                callback(Const.NETWORK_KOVAN);
                break
              default:
                GFD.setData('network', Const.NETWORK_DEV);
                callback(Const.NETWORK_DEV);
            }
        })
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

    setupContracts() {
        return;
        this.PXLPP.deployed().then((PXLPPInstance) => {
            this.VRE.deployed().then((VREInstance) => {
                VREInstance.setPXLPropertyContract(PXLPPInstance.address, {from: this.account}).then((r) => {console.info(r)}).catch((e) => {console.info(e)});
                PXLPPInstance.setPixelPropertyContract(VREInstance.address, {from: this.account}).then((r) => {console.info(r)}).catch((e) => {console.info(e)});
            });
        });
    }

    buyProperty(x, y, eth, ppc, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_RINKEBY)
            return callback(false);
        this.getVREInstance().then((i) => {
            if (eth == 0)
                return i.buyPropertyInPXL(this.toID(x, y), ppc, {from: this.account });
            else if (ppc == 0)
                return i.buyPropertyInETH(this.toID(x, y), { value: eth, from: this.account });
            else 
                return i.buyProperty(this.toID(x, y), ppc, {value: eth, from: this.account});
        }).then(() => {
            callback(true);
            this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " purchase complete."});
        }).catch((e) => {
            callback(false);
            console.info(e);
            this.sendResults(LISTENERS.Alert, {result: false, message: "Unable to purchase property " + (x + 1) + "x" + (y + 1) + "."});
        });
    }

    sellProperty(x, y, price, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_RINKEBY)
            return;
        this.getVREInstance().then((i) => {
            return i.listForSale(this.toID(parseInt(x), parseInt(y)), price, {from: this.account });
        }).then(() => {
            callback(true);
            this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " listed for sale."});
        }).catch((e) => {
            callback(false);
            console.log(e);
            this.sendResults(LISTENERS.Alert, {result: false, message: "Unable to put property " + (x + 1) + "x" + (y + 1) + " on market."});
        });
    }

    delistProperty(x, y, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_RINKEBY)
            return callback(false);
        this.getVREInstance().then((i) => {
            return i.delist(this.toID(parseInt(x), parseInt(y)), {from: this.account });
        }).then(() => {
            callback(true);
            this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " listed for sale."});
        }).catch((e) => {
            console.log(e);
            callback(false);
            this.sendResults(LISTENERS.Alert, {result: false, message: "Unable to put property " + (x + 1) + "x" + (y + 1) + " on market."});
        });
    }

    setPropertyMode(x, y, isPrivate, minutesPrivate, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_RINKEBY)
            return callback(false);
        this.getVREInstance().then((i) => {
            return i.setPropertyMode(this.toID(parseInt(x), parseInt(y)), isPrivate, minutesPrivate, {from: this.account });
        }).then((r) => {
            return callback(r);
        }).catch((e) => {
            console.log(e);
        });
    }

    //array of 2 32 bytes of string
    setHoverText(text) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_RINKEBY)
            return;
        this.getVREInstance().then((i) => {
            return i.setHoverText(Func.StringToBigInts(text), {from: this.account});
        }).then(function() {
            console.info("Hover text set!");
        }).catch((e) => {
            console.log(e);
        });
    }

    //array of 2 32 bytes
    setLink(text) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_RINKEBY)
            return;
        this.getVREInstance().then((i) => {
            return i.setLink(Func.StringToBigInts(text), {from: this.account });
        }).then(function() {
            console.info("Property link updated!");
        }).catch((e) => {
            console.log(e);
        });
    }

    transferProperty(x, y, newOwner, callback) { 
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_RINKEBY)
            return callback(false);
        this.getVREInstance().then((i) => {
            return i.transferProperty(this.toID(parseInt(x), parseInt(y)), newOwner, {from: this.account}).then((r) => {
                return callback(true);
            });
        }).catch((e) => {
            return callback(false);
        });
    }

    makeBid(x, y, bid, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_RINKEBY)
            return callback(false);
        this.getVREInstance().then((i) => {
            return i.makeBid(this.toID(x, y), bid, {from: this.account });
        }).then(() => {
            callback(true);
            this.sendResults(LISTENERS.Alert, {result: true, message: "Bid for " + (x + 1) + "x" + (y + 1) + " sent to owner."});
        }).catch((e) => {
            callback(false);
            this.sendResults(LISTENERS.Alert, {result: false, message: "Error placing bid."});
        });
    }

    setColors(x, y, data, PPT, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_RINKEBY)
            return callback(false);
        this.getVREInstance().then((i) => {
            return i.setColors(this.toID(x, y), Func.RGBArrayToContractData(data), PPT, {from: this.account });
        }).then(() => {
            callback(true);
            this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " pixels changed."});
        }).catch((e) => {
            callback(false);
            this.sendResults(LISTENERS.Alert, {result: false, message: "Error uploading pixels."});
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
        if (GFD.getData('noMetaMask'))
            return callback(false);
        this.getPXLPPInstance().then((i) => {
            i.balanceOf(this.account, { from: this.account }).then((r) => {
                callback(Func.BigNumberToNumber(r));
            });
        }).catch((e) => {
            console.info(e);
            this.sendResults(LISTENERS.Error, {result: false, message: "Unable to retrieve PPC balance."});
        });
    }

    getSystemSalePrices(callback) {
        if (GFD.getData('noMetaMask'))
            return callback(null);
        this.getVREInstance().then((i) => {
            return i.getSystemSalePrices.call().then((r) => {
                return callback(r);
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getForSalePrices(x, y, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
    this.getVREInstance().then((i) => {
            return i.getForSalePrices.call(this.toID(x, y)).then((r) => {
                return callback(r);
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getHoverText(address, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        this.getPXLPPInstance().then((i) => {
            return i.getOwnerHoverText.call(address).then((r) => {
                return callback(Func.BigIntsToString(r));
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getLink(address, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        this.getPXLPPInstance().then((i) => {
            return i.getOwnerLink.call(address).then((r) => {
                return callback(Func.BigIntsToString(r));
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getPropertyColorsOfRow(x, row, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        this.getPXLPPInstance().then((i) => {
            return i.getPropertyColorsOfRow.call(x, row).then((r) => {
                callback(x, row, Func.ContractDataToRGBAArray(r));
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getPropertyColors(x, y, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        this.getPXLPPInstance().then((i) => {
            return i.getPropertyColors.call(this.toID(x, y)).then((r) => {
                callback(x, y, Func.ContractDataToRGBAArray(r));
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    getPropertyData(x, y, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        //returns address, price, renter, rent length, rentedUntil, rentPrice
        this.getVREInstance().then((i) => {
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
        if (event !== EVENTS.AccountChange)
            throw 'No longer using events for contract events. Use get/watchEventLogs';
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

    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ----------------------------------         EVENTS          ----------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------------------
}

export const ctr = new Contract();