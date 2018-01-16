import React, { Component } from 'react';
import {Contract, ctr} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';

class PixelDescriptionBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: 0, 
            y: 0
        }
    }

    componentWillReceiveProps(newProps) {
        let update = this.state;
        if (newProps.x != this.props.x)
            update.x = newProps.x;
        if (newProps.y != this.props.y)
            update.y = newProps.y;
        this.setState(update);
    }

    setXY(key, event) {
        let obj = {};
        obj[key] = Math.max(0 ,Math.min(100, event.target.value));
        this.loadProperty(obj[key].x, obj[key].y);
        this.setState(obj);
    }

    loadProperty(x, y) {
        ctr.getPropertyData(x, y, (data) => {
            console.info(data);
        });
    }

    render() {
        return (
            <div>
                <div>
                    <canvas id='colorPreviewCanvas'></canvas>
                </div>
                <table id='data'>
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
                            <th>Color</th>
                            <td>{this.props.color}</td>
                        </tr>
                        <tr>
                            <th>Owner</th>
                            <td>{this.props.owner}</td>
                        </tr>
                        <tr>
                            <th>For Sale</th>
                            <td>{this.props.forSale}</td>
                        </tr>
                        <tr>
                            <th>For Rent</th>
                            <td>{this.props.forRent}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default PixelDescriptionBox