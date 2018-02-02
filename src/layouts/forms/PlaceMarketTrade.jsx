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

    }

    componentWillUnmount() {
    }

    placeTrade() {
        
        ctr.setBuyETHOffer(this.state.valueX, this.state.valueY, this.state.valuePrice)
    }

    handleInput(key, value) {
        let obj = {};
        obj[key] = value;
        this.setState(obj);
    }

    render() {
        return (
            <table cellSpacing={0} cellPadding={0} className='form'>
                <tbody>
                    <tr>
                        <td>
                            <div className='title'>
                                Place Trade:
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label className="switch">
                                <input type="checkbox" checked={this.state.tradingPPCToETH} onChange={(e) => this.handleInput('tradingPPCToETH', e.target.checked)}></input>
                                <span className="slider"></span>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'>PPC Amount</div>
                            <input id='PPC' type='number' onChange={(e) => this.handleInput('PPC', parseInt(e.target.value))} value={this.state.PPC}></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'>ETH Each</div>
                            <input id='ETH' type='number' onChange={(e) => this.handleInput('ETH', parseInt(e.target.value))} value={this.state.ETH}></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input type='button' value='Buy Pixel' onClick={() => this.placeTrade()}></input>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default PlaceMarketTrade