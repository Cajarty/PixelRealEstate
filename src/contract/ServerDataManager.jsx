import {ctr, Contract, EVENTS} from './contract.jsx';
import Axios from '../network/Axios.jsx';
import * as Func from '../functions/functions.jsx';

export class ServerDataManager {
    constructor() {
        //stored data
        this.allProperties = {};
        this.forSaleProperties = {};
        this.ownedProperties = {};

        //for network requests
        this.cancelToken = null;
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
    }

    setupEvents() {
        ctr.listenForEvent(EVENTS.PropertyColorUpdate, 'SDM-PropertyColorUpdate', (data) => {
            this.insertProperty(data.args);
            this.organizeProperty(data.args);
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
            console.info(data);
            // let pos = ctr.fromID(Func.BigNumberToNumber(data.args.property));
            // this.updateProperty(pos.x, pos.y, {owner: data.args.newOwner});
            // this.organizeProperty(pos.x, pos.y);
        });
        ctr.listenForEvent(EVENTS.DelistProperty, 'SDM-DelistProperty', (data) => {
            this.insertProperty(data.args);
            this.organizeProperty(data.args);
        });
        ctr.listenForEvent(EVENTS.ListTradeOffer, 'SDM-ListTradeOffer', (data) => {
            this.insertProperty(data.args);
            this.organizeProperty(data.args);
        });
        ctr.listenForEvent(EVENTS.AcceptTradeOffer, 'SDM-AcceptTradeOffer', (data) => {
            this.insertProperty(data.args);
            this.organizeProperty(data.args);
        });
        ctr.listenForEvent(EVENTS.CancelTradeOffer, 'SDM-CancelTradeOffer', (data) => {
            this.insertProperty(data.args);
            this.organizeProperty(data.args);
        });
        ctr.listenForEvent(EVENTS.SetPropertyPublic, 'SDM-SetPropertyPublic', (data) => {
            this.insertProperty(data.args);
            this.organizeProperty(data.args);
        });
        ctr.listenForEvent(EVENTS.SetPropertyPrivate, 'SDM-SetPropertyPrivate', (data) => {
            this.insertProperty(data.args);
            this.organizeProperty(data.args);
        });
    }

    /*
    Returns true/false on success/fail of the load.
    */
    requestServerData() {
        let cancelToken = null;
        Axios.getInstance().get('/getPropertyData', cancelToken).then((result) => {
            if (result.status == 200 && typeof result.data === 'object') {
                this.allProperties = result.data;
                this.organizeAllProperties();
                this.setupEvents();
                return true;
            } else {
                return false;
            }
        });
        this.cancelToken = cancelToken;
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
        this.allProperties[x][y] = Object.assign({}, this.allProperties[x][y], update);
    }

    /*
    Puts a new property or update on the main list into it.
    */
    insertProperty(x, y, property) {
        if (this.allProperties[x] == null)
            this.allProperties[x] = {};
        this.allProperties[x][y] = property;
    }
}

export const SDM = new ServerDataManager();