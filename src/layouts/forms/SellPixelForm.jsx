import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';

class SellPixelForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            valueX: 0,
            valueY: 0,
            valuePrice: 100000000000000000,
        };
    }

    handleInput(key, event) {
        let obj = {};
        obj[key] = event.target.value;
        this.setState(obj);
    }

    render() {
        return (
            <div className='form'>
                Sell Pixel:
                <br/>
                <div>
                    X: <input id='sellPixelX' type='number' onChange={(e) => this.handleInput('valueX', e)} value={this.state.valueX}></input>
                </div>
                <div>
                    Y: <input id='sellPixelY' type='number' onChange={(e) => this.handleInput('valueY', e)} value={this.state.valueY}></input>
                </div>
                <div>
                    Price: <input id='sellPrice' type='number' onChange={(e) => this.handleInput('valuePrice', e)} value={this.state.valuePrice}></input>
                </div>
                <div>
                    <input type='button' value='Sell Pixel' onClick={() => ctr.sellProperty(this.state.valueX, this.state.valueY, this.state.valuePrice)}></input>
                </div>
            </div>
        );
    }
}

export default SellPixelForm