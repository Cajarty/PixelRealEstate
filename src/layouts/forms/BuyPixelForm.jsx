import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';

class BuyPixelForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            valueX: 0,
            valueY: 0,
            payWithETH: true,
            valuePrice: 100000000000000000,
        };
    }

    componentWillReceiveProps(newProps) {
        let update = {};
        Object.keys(newProps).map((i) => {
            if (newProps[i] != this.props[i])
                update[i] = newProps[i];
        })
        this.setState(update);
    }

    componentDidMount() {
        this.setState({
            valueX: this.props.valueX,
            valueY: this.props.valueY,
        })
    }

    handleInput(key, value) {
        let obj = {};
        obj[key] = value;
        this.setState(obj);
        console.info(ctr.getForSalePrice(this.state.x, this.state.y)); //TODO get this to work and store and set the prices.
    }

    render() {
        return (
            <table className='form'>
                <tbody>
                    <tr>
                        <td>
                            <div className='title'>
                                Buy Pixel:
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> X: </div>
                            <input id='buyPixelX' type='number' onChange={(e) => this.handleInput('valueX', parseInt(e.target.value))} value={this.state.valueX}></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Y: </div>
                            <input id='buyPixelY' type='number' onChange={(e) => this.handleInput('valueY', parseInt(e.target.value))} value={this.state.valueY}></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Price: </div>
                            <label className="switch">
                                <input type="checkbox" checked={this.state.payWithETH} onChange={(e) => this.handleInput('payWithETH', e.target.checked)}></input>
                                <span className="slider"></span>
                            </label>
                            <input id='buyPrice' type='number' disabled onChange={(e) => {}} value={this.state.valuePrice}></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input type='button' value='Buy Pixel' onClick={() => ctr.buyProperty(this.state.valueX, this.state.valueY, this.state.valuePrice)}></input>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default BuyPixelForm