import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalFormData} from '../../functions/GlobalFormData';

class BuyPixelForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
            payWithETH: true,
            valuePrice: 100000000000000000,
        };
    }

    componentWillReceiveProps(newProps) {
        let update = {};
        Object.keys(newProps).map((i) => {
            if (newProps[i] != this.props[i]) {
                update[i] = newProps[i];
            }
        });
        this.setState(update);
    }

    componentDidMount() {
        GFD.listen('x', 'buyPixel', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'buyPixel', (y) => {
            this.setState({y});
        })
    }

    componentWillUnmount() {
        GFD.closeAll('buyPixel');
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
        console.info(ctr.getForSalePrice(GFD.getData('x') - 1, y - 1)); //TODO get this to work and store and set the prices.
    }

    buyProperty() {
        if (this.state.valueX >= 1 && this.state.valueX <= 100 && this.state.valueY >= 1 && this.state.valueY <= 100)
            ctr.buyProperty(this.state.x - 1, this.state.y - 1, this.state.valuePrice);
    }

    render() {
        return (
            <table cellSpacing={0} cellPadding={0} className='form'>
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
                            <input 
                                id='buyPixelX' 
                                type='number' 
                                onChange={(e) => this.setX(e.target.value)} 
                                value={this.state.x} 
                                placeholder='1-100'
                            ></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Y: </div>
                            <input 
                                id='buyPixelY' 
                                type='number' 
                                onChange={(e) => this.setY(e.target.value)} 
                                value={this.state.y} 
                                placeholder='1-100'
                            ></input>
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
                            <input type='button' value='Buy Pixel' onClick={() => this.buyProperty()}></input>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default BuyPixelForm