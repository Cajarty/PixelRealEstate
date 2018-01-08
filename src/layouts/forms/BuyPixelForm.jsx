import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';

class BuyPixelForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            valueX: 0,
            valueY: 0,
            valuePrice: 10000000000000000,
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
                Buy Pixel:
                <br/>
                <div>
                    X: <input id='buyPixelX' type='number' onChange={(e) => this.handleInput('valueX', e)} value={this.state.valueX}></input>
                </div>
                <div>
                    Y: <input id='buyPixelY' type='number' onChange={(e) => this.handleInput('valueY', e)} value={this.state.valueY}></input>
                </div>
                <div>
                    Price: <input id='buyPrice' type='number' onChange={(e) => this.handleInput('valuePrice', e)} value={this.state.valuePrice}></input>
                </div>
                <div>
                    <input type='button' value='Buy Pixel' onClick={() => ctr.buyProperty(this.state.valueX, this.state.valueY, this.state.valuePrice)}></input>
                </div>
            </div>
        );
    }
}

export default BuyPixelForm