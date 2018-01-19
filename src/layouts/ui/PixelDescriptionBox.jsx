import React, { Component } from 'react';
import {Contract, ctr} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';

class PixelDescriptionBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: 0, 
            y: 0,
            owner: "",
            isForSale: false,
            salePrice: 0,
            lastColorUpdate: 0,
            isInPrivate: false,
        }
    }

    componentWillReceiveProps(newProps) {
        let update = this.state;
        for (let i = 0; i < Object.keys(newProps).length; i++) {
            if (newProps[i] != this.props[i])
                update[i] = newProps[i];
        }
        this.setState(update);
    }

    setXY(key, event) {
        let obj = this.state;
        obj[key] = Math.max(0 ,Math.min(100, event.target.value));
        console.info(obj);
        this.loadProperty(obj[key].x, obj[key].y);
        this.setState(obj);
    }

    loadProperty(x, y) {
        ctr.getPropertyData(x, y, (data) => {
            console.info(data)
            let price = Func.BigNumberToNumber(data[1]);
            this.setState({
                owner: data[0],
                isForSale: price != 0,
                salePrice: price,
                lastColorUpdate: 0, //deal with this: with timestamp for since last time ::: data[2]
                isInPrivate: data[3],
            })
        });
    }

    render() {
        console.info(this.state);
        return (
            <div>
                <div>
                    <canvas id='colorPreviewCanvas'></canvas>
                </div>
                <table className='data'>
                    <tbody>
                        <tr>
                            <th>X</th>
                            <td><input type='number' value={this.state.x} onChange={(e) => this.setXY('x', e)}></input></td>
                        </tr>
                        <tr>
                            <th>Y</th>
                            <td><input type='number' value={this.state.y} onChange={(e) => this.setXY('y', e)}></input></td>
                        </tr>
                        <tr>
                            <th>Owner</th>
                            <td>{this.state.owner}</td>
                        </tr>
                        <tr>
                            <th>For Sale</th>
                            <td>{this.state.isForSale ? 'Yes' : 'No'}</td>
                        </tr>
                        {this.state.isForSale ? (
                            <tr>
                                <th>Price</th>
                                <td>{this.state.salePrice}</td>
                            </tr>
                        ) : null}
                        <tr>
                            <th>Last Color Change</th>
                            <td>{this.state.lastColorUpdate}</td>
                        </tr>
                        <tr>
                            <th>Is Private</th>
                            <td>{this.state.isInPrivate}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default PixelDescriptionBox