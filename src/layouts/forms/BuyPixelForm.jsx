import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';

class BuyPixelForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
            ETHPrice: 0,
            PPCPrice: 0,
            PPCSelected: 0,
            ETHToPay: 0,
            PPCToPay: 0,
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
            ctr.getForSalePrices(GFD.getData('x') - 1, y - 1, (data) => {
                let eth = Func.BigNumberToNumber(data[0]);
                let ppc = Func.BigNumberToNumber(data[1]);
                this.setState({
                    ETHPrice: eth, 
                    PPCPrice: ppc,
                    PPCSelected: 0,
                    ETHToPay: (eth != 0 ? eth : 0),
                    PPCToPay: (eth == 0 ? ppc : 0),
                });
            });
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
    }

    buyProperty() {
        if (this.state.x >= 1 && this.state.x <= 100 && this.state.y >= 1 && this.state.y <= 100) {
            ctr.buyProperty(this.state.x - 1, this.state.y - 1, this.state.ETHToPay, this.state.PPCToPay);
        }
    }
    
    updatePriceSlider(value) {
        let totals = this.calculateTotal(value);

        this.setState({
            PPCSelected: value,
            ETHToPay: totals.ETH,
            PPCToPay: totals.PPC
        });
    }

    calculateTotal(ppcSelected) {
        let obj = {
            ETH: this.state.ETHPrice, 
            PPC: this.state.PPCPrice
        };
        if (this.state.ETHPrice == 0)
            return obj;
        obj.PPC = ppcSelected;
        obj.ETH = Math.ceil(((this.state.PPCPrice - ppcSelected) / this.state.PPCPrice) * this.state.ETHPrice);
        return obj;
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
                            {this.state.ETHPrice != 0 &&
                                <div className='priceSliderBase'>
                                    <div className='ETH'>
                                        ETH {this.state.ETHPrice}
                                    </div>
                                    <input 
                                        type="range" 
                                        min={0} 
                                        max={this.state.PPCPrice} 
                                        value={this.state.PPCSelected} 
                                        onChange={(e) => this.updatePriceSlider(e.target.value)}
                                    ></input>
                                    <div className='PPC'>
                                        PPC {this.state.PPCPrice}
                                    </div>
                                </div>
                            }
                            <div className='total'>
                                {this.state.ETHToPay == 0 ? '' : this.state.ETHToPay + ' ETH'}
                                {this.state.ETHToPay != 0 && this.state.PPCToPay != 0 ? ', ' : ''}
                                {this.state.PPCToPay == 0 ? '' : this.state.PPCToPay + ' PPC'}
                            </div>
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