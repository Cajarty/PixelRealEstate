
// Import libraries we need.
import { default as Web3 } from 'web3';
import * as Const from '../const/const.jsx';
import * as Func from '../functions/functions.jsx';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import VirtualRealEstate from '../../build/contracts/VirtualRealEstate.json'

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

        // Get the initial account balance so it can be displayed.
        window.web3.eth.getAccounts((err, accs) => {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            this.accounts = accs;
            this.account = this.accounts[0];
            /*
            VRE.deployed().then((instance) => {

                for (let i = 0; i < WIDTH * HEIGHT; i++) {
                    instance.getColor.call(i, { from: account }).then((r) => {
                        setCanvasPixel(i % WIDTH, Math.floor(i / WIDTH), r[0], r[1], r[2]);
                    });
                }

                event = instance.PixelColorUpdate();
                event.watch((error, result) => {
                    if (error)
                        console.info(result, error);
                    let x = result.args.pixel.c[0] % WIDTH;
                    let y = Math.floor(result.args.pixel.c[0] / WIDTH);
                    console.info('pixel update: ', x, y);
                    setCanvasPixel(x, y, result.args.red.c[0], result.args.green.c[0], result.args.blue.c[0]);
                });
            }).catch((c) => {
                console.info(c);
            });
        });*/
        });
    }

    toID(x, y) {
        return y * Const.PROPERTIES_WIDTH + x;
    }

    fromID(id) {
        let obj = {x: 0, y: 0};
        obj.x = id % Const.PROPERTIES_WIDTH;
        obj.y = Math.floor(id / 1000);
        return obj;
    }

    buyProperty(x, y, price) {
        this.VRE.deployed().then((i) => {
            return i.buyProperty(this.toID(x, y), { value: price, from: this.account });
        }).then(() => {
            this.sendResults(true, "Property " + x + "x" + y + " purchase complete.");
        }).catch((e) => {
            console.info(e);
            this.sendResults(false, "Unable to purchase property " + x + "x" + y + ".");
        });
    }

    sellProperty(x, y, price) {
        this.VRE.deployed().then((i) => {
            return i.listforSale(this.toID(x, y), {from: this.account });
        }).then(() => {
            console.info("Pixel " + x + "x" + y + " purchase complete.");
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

    getPropertyData(x, y) {
        //returns address, price, renter, rent length, rentedUntil, rentPrice
        this.VRE.deployed().then((i) => {
            return i.getPropertyData.call(this.toID(x, y)).then((r) => {
                return r;
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
        }).catch((e) => {
            this.sendResults(false, "Error uploadimg pixels.");
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
    Subscriber functions for function call returns on the contract so the
    ui can update when it sees a change.
    */
    listenForResults(key, callback) {
        this.listeners[key] = callback;
    }

    stopListeningForResults(key) {
        delete this.listeners[key];
    }

    sendResults(result, message) {
        Object.keys(this.listeners).map((i) => {
            this.listeners[i](result, message);
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