import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import PanelContainer from '../ui/PanelContainer';

const compares = {
    xDesc: 0
};

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
        let promise = SDM.orderPropertyListAsync(SDM.ownedProperties, (a,b) => {return a.x < b.x;});

        let relisten = (results) => {
            this.setState({orderedItems: results.data});
            console.info(results);
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
                <PanelContainer
                    data={this.state.orderedItems}
                />
            </div>
        );
    }
}

export default PlaceMarketTrade