import {ctr, Contract} from './contract.jsx';
import Axios from '../network/Axios.jsx';

export class ServerDataManager {
    constructor() {
        //stored data
        this.allProperties = {};
        this.forSaleProperties = {};
        this.ownedProperties = {};

        //for network requests
        this.cancelToken = null;
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
                console.info(this);
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
                        this.organizeProperty(x, y, this.allProperties[x][y]);
                }
        }
    }

    /*
    Updates the other data depending if it applies.
    */
    organizeProperty(x, y, property) {

        if (ctr.account === property.owner) {
            if (this.ownedProperties[x] == null)
                this.ownedProperties[x] = {};
            this.ownedProperties[x][y] = property;
        }

        if (property.isForSale) {
            if (this.forSaleProperties[x] == null)
                this.forSaleProperties[x] = {};
            this.forSaleProperties[x][y] = property;
        }
    }

    /*
    Puts a new property or update on the main list into it.
    */
    insertProperty(property) {
        if (this.allProperties[property.x] == null)
            this.allProperties[property.x] = {};
        this.allProperties[property.x][property.y] = property;
    }
}

export const SDM = new ServerDataManager();