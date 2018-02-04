import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalFormData} from '../../functions/GlobalFormData';

class SellPixelForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
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
        GFD.listen('x', 'sellPixel', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'sellPixel', (y) => {
            this.setState({y});
        })
    }

    componentWillUnmount() {
        GFD.closeAll('sellPixel');
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
    }

    handlePrice(key, value) {
        let obj = {};
        obj[key] = parseInt(value);
        this.setState(obj);
    }

    render() {
        return (
            <table cellSpacing={0} cellPadding={0} className='form'>
                <tbody>
                    <tr>
                        <td colSpan={2}>
                            <div className='title'>
                                Sell Pixel:
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> X: </div>
                        </td>
                        <td>
                            <input 
                                id='sellPixelX' 
                                type='number' 
                                placeholder='1-100'
                                onChange={(e) => this.setX(e.target.value)} 
                                value={this.state.x}
                                ></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Y: </div>
                        </td>
                        <td>
                            <input 
                                id='sellPixelY' 
                                type='number' 
                                placeholder='1-100'
                                onChange={(e) => this.setY(e.target.value)} 
                                value={this.state.y}
                            ></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Price: </div>
                        </td>
                        <td>
                            <input id='sellPrice' type='number' onChange={(e) => this.handlePrice('valuePrice', e.target.value)} value={this.state.valuePrice}></input>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <input type='button' value='Sell Pixel' onClick={() => ctr.sellProperty(this.state.x - 1, this.state.y - 1, this.state.valuePrice)}></input>
                        </td>
                    </tr>
                </tbody>
                
            </table>
        );
    }
}

export default SellPixelForm