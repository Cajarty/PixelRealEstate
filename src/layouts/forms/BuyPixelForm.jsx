import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';

class BuyPixelForm extends Component {
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
        obj[key] = parseInt(event.target.value);
        this.setState(obj);
    }

    render() {
        return (
            <table className='form'>
                <tbody>
                    <tr>
                        <td colSpan={2}>
                            <div className='title'>
                                Buy Pixel:
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> X: </div>
                        </td>
                        <td>
                            <input id='buyPixelX' type='number' onChange={(e) => this.handleInput('valueX', e)} value={this.state.valueX}></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Y: </div>
                        </td>
                        <td>
                            <input id='buyPixelY' type='number' onChange={(e) => this.handleInput('valueY', e)} value={this.state.valueY}></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Price: </div>
                        </td>
                        <td>
                            <input id='buyPrice' type='number' onChange={(e) => this.handleInput('valuePrice', e)} value={this.state.valuePrice}></input>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <input type='button' value='Buy Pixel' onClick={() => ctr.buyProperty(this.state.valueX, this.state.valueY, this.state.valuePrice)}></input>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default BuyPixelForm