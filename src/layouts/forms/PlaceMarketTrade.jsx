import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';
import {SDM, ServerDataManager, Compares} from '../../contract/ServerDataManager.jsx';
import PanelContainerOwned from '../ui/PanelContainerOwned';

class PlaceMarketTrade extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PPC: '',
            ETH: '',
            tradingPPCtoETH: false,
            orderedItems: [],
        };
        this.cancelSort = false;
    }

    componentDidMount() {
        //get my current market trade and populate fields
        let promise = SDM.orderPropertyListAsync(SDM.ownedProperties, Compares.xDesc.func);

        let relisten = (results) => {
            this.setState({orderedItems: results.data});
            if (results.promise && !this.cancelSort)
                results.promise.then(relisten);
        }

        promise.then(relisten);
    }

    componentWillUnmount() {
        this.cancelSort = true;
    }

    handleInput(key, value) {
        let obj = {};
        obj[key] = value;
        this.setState(obj);
    }

    render() {
        return (
            <div>
                <PanelContainerOwned
                    data={this.state.orderedItems}
                    viewStart={0}
                    viewEnd={1}
                />
            </div>
        );
    }
}

export default PlaceMarketTrade