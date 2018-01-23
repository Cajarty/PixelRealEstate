import React, { Component } from 'react';
import {Contract, ctr} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';

class PixelDescriptionBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '', 
            y: '',
            ctx: null,
            dataCtx: null,
            owner: "",
            isForSale: false,
            salePrice: 0,
            lastColorUpdate: 0,
            isInPrivate: false,
        }
    }

    componentWillReceiveProps(newProps) {
        let update = {};
        Object.keys(newProps).map((i) => {
            if (newProps[i] != this.props[i])
                update[i] = newProps[i];
        })
        if (update.x != null && update.y != null)
            this.loadProperty(newProps.x, newProps.y);
        this.setState(update);
    }

    componentDidMount() {
        let ctx = this.canvas.getContext('2d');
        ctx.scale(10, 10);
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        let dataCtx = this.dataCanvas.getContext('2d');
        dataCtx.imageSmoothingEnabled = false;
        dataCtx.webkitImageSmoothingEnabled = false;
        if (this.props.x != null && this.props.y != -1 && this.props.x != null && this.props.y != -1) 
            this.loadProperty(this.props.x, this.props.y);
        this.setState({
            ctx, 
            dataCtx,
            x: this.props.x,
            y: this.props.y,
        });
    }

    setXY(key, event) {
        let obj = {
            x: this.state.x == '' ? 0 : this.state.x, 
            y: this.state.y == '' ? 0 : this.state.y
        };
        obj[key] = Math.max(0 ,Math.min(100, event.target.value));
        this.loadProperty(obj.x, obj.y);
        this.setState(obj);
    }

    setCanvas(rgbArr) {
        let ctxID = this.state.dataCtx.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        this.state.dataCtx.putImageData(ctxID, 0, 0);
        this.state.ctx.drawImage(this.dataCanvas, 0, 0);
    }

    loadProperty(x, y) {
        ctr.getPropertyData(x, y, (data) => {
            //console.info(data)
            let price = Func.BigNumberToNumber(data[1]);
            this.setState({
                owner: data[0],
                isForSale: price != 0,
                salePrice: price,
                lastColorUpdate: 0, //deal with this: with timestamp for since last time ::: data[2]
                isInPrivate: data[3],
            })
        });
        ctr.getPropertyColors(x, y, (x, y, data) => {
            this.setCanvas(data);
        });
    }

    render() {
        return (
            <div>
                <div className='colorPreview'>
                    <canvas id='colorPreviewCanvas' width={100} height={100} ref={(canvas) => { this.canvas = canvas; }} ></canvas>
                    <canvas className='hidden' width={10} height={10} ref={(dataCanvas) => { this.dataCanvas = dataCanvas; }} ></canvas>
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
                            <td>{this.state.isInPrivate ? 'Yes' : 'No'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default PixelDescriptionBox