
// Import libraries we need.
import { default as Web3 } from 'web3';
import * as Const from '../const/const.jsx';
import * as Func from '../functions/functions.jsx';
import sigUtil from 'eth-sig-util';
import * as EVENTS from '../const/events';
import { default as contract } from 'truffle-contract';
import {GFD, GlobalState} from '../functions/GlobalState';
import {SDM, ServerDataManager} from '../contract/ServerDataManager';
const ethers = require('ethers');
const CTRDATA = require('./ContractData');

// Import our contract artifacts and turn them into usable abstractions.
import VirtualRealEstate from '../../build/contracts/VirtualRealEstate.json'
import PXLProperty from '../../build/contracts/PXLProperty.json'
import StandardToken from '../../build/contracts/StandardToken.json'


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
    PendingSetPixelUpdate: 'PendingSetPixelUpdate',
}; 

export class Contract {
    constructor() {

        this.provider = null;

        this.accounts = null;
        this.account = null;
        this.VRE = null;//contract(VirtualRealEstate);
        this.PXLPP = null;//contract(PXLProperty);
        this.ST = null;//contract(StandardToken);

        this.startLoadBlock = 0;
        this.gasBuffer = 1.01; //extra gas added onto calculation.

        this.VREInstance = null;
        this.PXLPPInstance = null;
        this.STInstance = null;

        this.propertyTradeLog = [];

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
        window.addEventListener('load', (ev) => {
            if (typeof web3 !== 'undefined') {
                window.web3 = new Web3(window.web3.currentProvider);
                console.info('Web3 & MetaMask.');            

                this.provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
    
                this.updateNetwork((id) => {
                    if (id === Const.NETWORK_MAIN) {
                         this.getAccount();
            
                        SDM.init();
                        window.web3.eth.getBlock('latest').then((latestBlock) => {
                            this.startLoadBlock = latestBlock.number - 1;
                        });
    
                        GFD.setData('noMetaMask', false);
                    }
                });
            } else {
                console.info('No MetaMask.');
                GFD.setData('noMetaMask', true);
                SDM.initNoMetaMask();
            }
        });
    }

    getAccount(callback = () => {}) {
        if (GFD.getData('noMetaMask'))
            return callback(null);

        if (this.account == null) {
            this.account = this.provider.getSigner(0);
        }
        this.account.getAddress().then((address) => {
            this.account.address = address;
            callback(this.account);
        });

            // if (err != null) {
            //     if (GFD.getData('advancedMode')) {
            //         this.sendResults(LISTENERS.Error, {errorId: 1, errorType: ERROR_TYPE.Error, message: "In order to fully interact with the client, it is required to have the MetaMask.io web-plugin installed. MetaMask allows you to store your earnings securely in your own Ethereum lite-wallet. "});
            //     } else {
            //         this.sendResults(LISTENERS.Error, {errorId: 1, errorType: ERROR_TYPE.Error, message: "The canvas is updating every 15 seconds. Get instant updates with https://metamask.io/ ."});
            //     }
            //     return;
            // }

            // if (accs.length == 0) {
            //     if (GFD.getData('advancedMode')) {
            //         this.sendResults(LISTENERS.Error, {errorId: 0, errorType: ERROR_TYPE.Error, message: "Couldn't retrieve any accounts! Make sure you're logged into Metamask."});
            //     }
            //     GFD.setData('noAccount', true);
            //     return;
            // }

            // GFD.setData('noAccount', false);
            // this.sendResults(LISTENERS.Error, {removeErrors: [0, 1], message: ''});

            // this.accounts = accs;
            // if (this.account !== this.accounts[0].toLowerCase()) {
            //     this.account = this.accounts[0].toLowerCase();
            //     this.sendEvent(EVENTS.AccountChange, this.account);
            //     SDM.init();
            // }
    }

    /*
    Requests all events of event type EVENT.
    event = event type
    blocks = how many blocks to look back
    params = {}. for narrowing serach results
    */
    getEventLogs(event, params, callback, startBlock = 0, endBlock = 1) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return;

        // VRE DApp Events
        this.VRE.deployed().then((i) => {
            let filter = {
                fromBlock: startBlock, 
                toBlock: endBlock,
                address: Const.VirtualRealEstate,
            };

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

            let filter = {
                fromBlock: this.startLoadBlock, 
                toBlock: 'latest',
                address: Const.PXLProperty,
            };

            switch(event) {
                case EVENTS.Transfer:
                    return i.Transfer(params, filter).get(callback);
                case EVENTS.Approval:
                    return i.Approval(params, filter).get(callback);
            }
        });
    }

    /*
    Requests all events of event type EVENT.
    block = how many blocks to look back
    */
    watchEventLogs(event, params, callback, blocks = 0) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return;

        if (this.startLoadBlock <= 0) {
            window.web3.eth.getBlock('latest').then((latestBlock) => {
                this.startLoadBlock = latestBlock.number;
                this.watchEventLogs(event, params, callback, blocks);
            });
            return;
        }

        let filter = {
            fromBlock: this.startLoadBlock - blocks, 
            toBlock: 'latest',
            address: Const.VirtualRealEstate,
        };

        switch (event) {
            case EVENTS.PropertyBought:
            case EVENTS.PropertyColorUpdate:
            case EVENTS.SetUserHoverText:
            case EVENTS.SetUserSetLink:
            case EVENTS.PropertySetForSale:
            case EVENTS.DelistProperty:
            case EVENTS.SetPropertyPublic:
            case EVENTS.SetPropertyPrivate:
            case EVENTS.Bid:
                return this._watchVREEventLogs(event, callback);
            case EVENTS.Transfer:
            case EVENTS.Approval:
                return this._watchPXLEventLogs(event, callback);
            default:
                return;
        }
    }

    _watchVREEventLogs(event, callback) {
        this.getVREContract((i) => {
            i.on(event, callback);
        });
    }

    _watchPXLEventLogs(event, callback) {
        this.getPXLContract((i) => {
            i.on(event, callback);
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

    getVREContract(callback/*(contract)*/) {
        if (!this.VRE) {
            this.VRE = new ethers.Contract(CTRDATA.VRE_Address, CTRDATA.VRE_ABI, this.provider);
        }
        return callback(this.VRE);
    }

    getPXLContract(callback/*(contract)*/) {
        if (!this.PXLPP) {
            this.PXLPP = new ethers.Contract(CTRDATA.PXL_Address, CTRDATA.PXL_ABI, this.provider);
        }
        return callback(this.PXLPP);
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
        // for connecting new contracts together so we know which are the current ones
        // this.PXLPP.deployed().then((PXLPPInstance) => {
        //     this.VRE.deployed().then((VREInstance) => {
        //         PXLPPInstance.setPixelPropertyContract(VREInstance.address, {from: this.account}).then((r) => {console.info(r)}).catch((e) => {console.info(e)});
        //         VREInstance.setPXLPropertyContract(PXLPPInstance.address, {from: this.account}).then((r) => {console.info(r)}).catch((e) => {console.info(e)});
        //     });
        // });
    }

    buyProperty(x, y, eth, ppc, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        this.getVREContract((i) => {
            if (eth == 0)
                return i.buyPropertyInPXL.estimateGas(this.toID(x, y), ppc, {from: this.account }).then((gas) => {
                    return i.buyPropertyInPXL(this.toID(x, y), ppc, {from: this.account, gas: Math.ceil(gas * this.gasBuffer) });
                }).catch((e) => {
                    console.info(e);
                    callback(false);
                    return;
                })
            else if (ppc == 0)
                return i.buyPropertyInETH.estimateGas(this.toID(x, y), { value: eth + 10, from: this.account}).then((gas) => {
                    return i.buyPropertyInETH(this.toID(x, y), { value: eth + 10, from: this.account, gas: Math.ceil(gas * this.gasBuffer) });
                }).catch((e) => {
                    console.info(e);
                    callback(false);
                    return;
                })
            else 
                return i.buyProperty.estimateGas(this.toID(x, y), ppc, {value: eth + 10, from: this.account}).then((gas) => {
                    return i.buyProperty(this.toID(x, y), ppc, {value: eth + 10, from: this.account, gas: Math.ceil(gas * this.gasBuffer)});
                }).catch((e) => {
                    console.info(e);
                    callback(false);
                    return;
                })
        }).then(() => {
            callback(true);
            this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " purchase complete."});
        }).catch((e) => {
            if (!e.toString().includes("wasn't processed in")) {
                console.info(e);
                callback(false);
                this.sendResults(LISTENERS.Alert, {result: false, message: "Unable to purchase property " + (x + 1) + "x" + (y + 1) + "."});
            } else {
                console.info('Timed out.')
            }
            callback(true);
        });
    }

    sellProperty(x, y, price, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return;
        this.getVREContract((i) => {
            return i.listForSale.estimateGas(this.toID(parseInt(x), parseInt(y)), price, {from: this.account }).then((gas) => {
                return i.listForSale(this.toID(parseInt(x), parseInt(y)), price, {from: this.account, gas: Math.ceil(gas * this.gasBuffer) });
            }).then(() => {
                callback(true);
                this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " listed for sale."});
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Unable to put property " + (x + 1) + "x" + (y + 1) + " on market."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    delistProperty(x, y, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        this.getVREContract((i) => {
            i.delist.estimateGas(this.toID(parseInt(x), parseInt(y)), {from: this.account }).then((gas) => {
                return i.delist(this.toID(parseInt(x), parseInt(y)), {from: this.account, gas: Math.ceil(gas * this.gasBuffer) });
            }).then(() => {
                callback(true);
                this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " listed for sale."});
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error cancelling sale offer for " + (x + 1) + "x" + (y + 1) + "."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    setPropertyMode(x, y, isPrivate, minutesPrivate, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        this.getVREContract((i) => {
            return i.setPropertyMode.estimateGas(this.toID(parseInt(x), parseInt(y)), isPrivate, minutesPrivate, {from: this.account }).then((gas) => {
                return i.setPropertyMode(this.toID(parseInt(x), parseInt(y)), isPrivate, minutesPrivate, {from: this.account, gas: Math.ceil(gas * this.gasBuffer) });
            }).then((r) => {
                return callback(true);
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error updating Property " + (x + 1) + "x" + (y + 1) + " mode."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    //array of 2 32 bytes of string
    setHoverText(text, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return;
        this.getVREContract((i) => {
            return i.setHoverText.estimateGas(Func.StringToBigInts(text), {from: this.account}).then((gas) => {
                return i.setHoverText(Func.StringToBigInts(text), {from: this.account, gas: Math.ceil(gas * this.gasBuffer)});
            }).then(function() {
                callback(true);
                console.info("Hover text set!");
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error setting hover text."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    //array of 2 32 bytes
    setLink(text, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return;
        this.getVREContract((i) => {
            return i.setLink.estimateGas(Func.StringToBigInts(text), {from: this.account }).then((gas) => {
                return i.setLink(Func.StringToBigInts(text), {from: this.account, gas: Math.ceil(gas * this.gasBuffer) });
            }).then(function() {
                callback(true);
                console.info("Property link updated!");
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error setting link."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    transferProperty(x, y, newOwner, callback) { 
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        if (!this.isAddress(newOwner)) {
            this.sendResults(LISTENERS.Alert, {result: false, message: "Not a valid address! Aborting."});
            return callback(false);
        }
        this.getVREContract((i) => {
            return i.transferProperty.estimateGas(this.toID(parseInt(x), parseInt(y)), newOwner, {from: this.account}).then((gas) => {
                return i.transferProperty(this.toID(parseInt(x), parseInt(y)), newOwner, {from: this.account, gas: Math.ceil(gas * this.gasBuffer)}).then((r) => {
                    return callback(true);
                });
            });
        }).catch((e) => {
            if (!e.toString().includes("wasn't processed in")) {
                callback(false);
                this.sendResults(LISTENERS.Alert, {result: false, message: "Error transfering Property " + (x + 1) + "x" + (y + 1) + "."});
            } else {
                console.info('Timed out.')
            }
            callback(true);
        });
    }

    makeBid(x, y, bid, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        this.getVREContract((i) => {
            return i.makeBid.estimateGas(this.toID(x, y), bid, {from: this.account }).then((gas) => {
                return i.makeBid(this.toID(x, y), bid, {from: this.account, gas: Math.ceil(gas * this.gasBuffer) });
            }).then(() => {
                callback(true);
                this.sendResults(LISTENERS.Alert, {result: true, message: "Bid for " + (x + 1) + "x" + (y + 1) + " sent to owner."});
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error placing bid on Property " + (x + 1) + "x" + (y + 1) + "."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    setColors(x, y, data, PPT, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        this.getVREContract((i) => {
            callback('pending');
            i.setColors.estimateGas(this.toID(x, y), Func.RGBArrayToContractData(data), PPT, {from: this.account }).then((gas) => {
                return i.setColors(this.toID(x, y), Func.RGBArrayToContractData(data), PPT, {from: this.account, gas: Math.ceil(gas * this.gasBuffer)});
            }).then(() => {
                callback(true);
                this.sendResults(LISTENERS.Alert, {result: true, message: "Property " + (x + 1) + "x" + (y + 1) + " pixels changed."});
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error uploading image to Property " + (x + 1) + "x" + (y + 1) + "."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
        });
    }

    sendPXL(PXL, address, callback) {
        if (GFD.getData('noMetaMask') || GFD.getData('noAccount') || GFD.getData('network') !== Const.NETWORK_MAIN)
            return callback(false);
        if (!this.isAddress(address)) {
            this.sendResults(LISTENERS.Alert, {result: false, message: "Not a valid address! Aborting."});
            return callback(false);
        }
        this.getSTInstance().then((i) => {
            i.transfer(address, PXL, {from: this.account}).then(() => {
                callback(true);
                this.sendResults(LISTENERS.Alert, {result: true, message: PXL + " PXL sent to address " + address + "."});
            }).catch((e) => {
                if (!e.toString().includes("wasn't processed in")) {
                    callback(false);
                    this.sendResults(LISTENERS.Alert, {result: false, message: "Error sending PXL to " + address + "."});
                } else {
                    console.info('Timed out.')
                }
                callback(true);
            });
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
    getCurrentBlock(callback, pending = false) {
        window.web3.eth.getBlock(pending ? 'pending' : 'latest', false, callback);
    }

    isAddress(address) {
        if (GFD.getData('ServerDataManagerInit') < 2)
            return false;
        return window.web3.utils.isAddress(address);
    }

    getBalance(callback) {
        if (GFD.getData('noMetaMask'))
            return callback(0);
        this.getPXLContract((pxlCtr) => {
            this.getAccount((acc) => {
                pxlCtr.balanceOf(acc.address).then((r) => {
                    callback(Func.BigNumberToNumber(r));
                });
            });
        });
    }

    getBalanceOf(address, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(0);
        this.getPXLContract((i) => {
            i.balanceOf(address, { from: this.account }).then((r) => {
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
        this.getVREContract((i) => {
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
        this.getVREContract((i) => {
            return i.getForSalePrices.call(this.toID(x, y)).then((r) => {
                return callback(r);
            });
        }).catch((e) => {
            console.error(e);
        });
    }

    getHoverText(address, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        this.getPXLContract((i) => {
            return i.getOwnerHoverText(address).then((r) => {
                return callback(Func.BigIntsToString(r));
            });
        });
    }

    getLink(address, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        this.getPXLContract((i) => {
            return i.getOwnerLink(address).then((r) => {
                return callback(Func.BigIntsToString(r));
            });
        }).catch((e) => {
            console.error(e);
        });
    }

    getPropertyColorsOfRow(x, row, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        this.getPXLContract((i) => {
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
        this.getPXLContract((i) => {
            return i.getPropertyColors(this.toID(x, y)).then((r) => {
                if (r[0] == 0 && r[1] == 0 && r[2] == 0 && r[3] == 0 && r[4] == 0)
                    callback(x, y, Func.ContractDataToRGBAArray(r), true);
                else
                    callback(x, y, Func.ContractDataToRGBAArray(r), false);
            });
        });
    }

    getPropertyData(x, y, callback) {
        if (GFD.getData('noMetaMask'))
            return callback(false);
        //returns address, price, renter, rent length, rentedUntil, rentPrice
        this.getVREContract((i) => {
            i.getPropertyData(this.toID(x, y)).then((r) => {
                return callback(r);
            });
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