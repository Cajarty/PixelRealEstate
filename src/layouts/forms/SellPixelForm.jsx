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
                                Sell Pixel:
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> X: </div>
                        </td>
                        <td>
                            <input id='sellPixelX' type='number' onChange={(e) => this.handleInput('valueX', e)} value={this.state.valueX}></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Y: </div>
                        </td>
                        <td>
                            <input id='sellPixelY' type='number' onChange={(e) => this.handleInput('valueY', e)} value={this.state.valueY}></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Price: </div>
                        </td>
                        <td>
                            <input id='sellPrice' type='number' onChange={(e) => this.handleInput('valuePrice', e)} value={this.state.valuePrice}></input>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <input type='button' value='Sell Pixel' onClick={() => ctr.sellProperty(this.state.valueX, this.state.valueY, this.state.valuePrice)}></input>
                        </td>
                    </tr>
                </tbody>
                
            </table>
        );
    }
}

export default SellPixelForm