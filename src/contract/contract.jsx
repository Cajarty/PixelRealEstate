
// Import libraries we need.
import { default as Web3 } from 'web3';
import * as Const from '../const/const.jsx';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import VirtualRealEstate from '../../build/contracts/VirtualRealEstate.json'

export class Contract {
    constructor() {
        this.accounts;
        this.account;
        this.VRE = contract(VirtualRealEstate);
        this.setup();
        this.pixelsOwned = {};
        this.pixelsRented = {};
        this.pixelsForSale = {};
        this.pixelsForRent = {};
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

    }

    fromID(id) {
        
    }

    buyProperty(x, y, price) {
        this.VRE.deployed().then((i) => {
            let pos = (y * Const.CANVAS_HEIGHT) + x;
            return i.buy(pos, { value: price, from: this.account });
        }).then(function() {
            console.info("Pixel " + x + "x" + y + " purchase complete.");
        }).catch((e) => {
            console.log(e);
            console.info("Error buying pixel.");
        });
    }

    sellProperty(x, y, price) {
        this.VRE.deployed().then((i) => {
            let pos = (y * Const.CANVAS_HEIGHT) + x;
            return i.listforSale(pos, { value: price, from: this.account });
        }).then(function() {
            console.info("Pixel " + x + "x" + y + " purchase complete.");
        }).catch((e) => {
            console.log(e);
            console.info("Error buying pixel.");
        });
    }

    //array of 2 32 bytes of string
    setHoverText() {
        this.VRE.deployed().then((i) => {
            let pos = (y * Const.CANVAS_HEIGHT) + x;
            return i.listforSale(pos, { value: price, from: this.account });
        }).then(function() {
            console.info("Pixel " + x + "x" + y + " purchase complete.");
        }).catch((e) => {
            console.log(e);
            console.info("Error buying pixel.");
        });
    }

    //array of 2 32 bytes
    setLink() {

    }

    getForSalePrice(x, y) {
        //return price
    }

    getForRentPrice(x, y) {
        //returns price
    }

    getHoverText(x, y) {
        //returns array of 2 32 bytes of string
    }

    getLink(x, y) {
        //returns array of 2 32 bytes of string
    }

    getPropertyColors(x, y) {
        //returns array of 10 256 bits
    }

    getPropertyData(x, y) {
        //returns address, price, renter, rent length, rentedUntil, rentPrice
    }

    setColors(x, y/*, array of 10 of big ints (256)*/) {

    }

    rentProperty(x, y, price) {

    }

    stopRenting(x, y) {

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
}

export const ctr = new Contract();