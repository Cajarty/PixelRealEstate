import React, { Component } from 'react'
import * as Const from '../../const/const.jsx';
import {ctr, Contract} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';

var start = 0;

class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ctx: null,
            imageData: null,
            pixelData: {},
            loadValue: 0,
        }
        this.setCanvasProperty = this.setCanvasProperty.bind(this);
        this.appendPixelData = this.appendPixelData.bind(this);
        this.pixelData = [];
    }

    componentDidMount() {
        let ctx = this.canvas.getContext("2d");
        let imageData = ctx.createImageData(Const.CANVAS_WIDTH, Const.CANVAS_HEIGHT);
        this.setState({ ctx, imageData });
        ctx.imageSmoothingEnabled = false;
        //ctr.getPropertyColors(x, y, this.appendPixelData);
        start = new Date().getTime();
        this.loadPixels(0);
    }

    loadPixels(baseHeight) {
        for(let x = 0; x < 100; x += 10) {
            ctr.getPropertyColorsOfRow(x, baseHeight, this.appendPixelData);
        }
    }

    appendPixelData(x, row, data) {
        if (this.state.pixelData[row] == null)
            this.state.pixelData[row] = {};
        this.state.pixelData[row][x] = data;
        if ((row + 1) % 200 == 0) {
            this.completePixelDataLoad(row);
        }
        if (row >= 999)
            return;
        ctr.getPropertyColorsOfRow(x, row + 1, this.appendPixelData);
    }

    completePixelDataLoad(height) {
        let loadValue =  this.state.loadValue + 1;
        this.setState({loadValue});
        if (loadValue < ((height + 1) / 100) * 5) {
            return;
        }
        console.info(height);
        let ctxID = this.state.ctx.createImageData(Const.CANVAS_WIDTH, 200);
        let counter = 0;
        for(let row = height - 199; row < height + 1; row++) {
            for(let x = 0; x < 100; x += 10) {
                if (this.state.pixelData[row] == null || this.state.pixelData[row][x] == null) {
                    for (let i = 0; i < 400; i++) {
                        ctxID.data[counter++] = 0;
                    }
                } else {
                    for (let i = 0; i < 400; i++) {
                        ctxID.data[counter++] = this.state.pixelData[row][x][i];
                    }
                }
            }
        }
        this.state.ctx.putImageData(ctxID, 0, height - 199);
        if (height == 999)
            console.info("Time passed: ", new Date().getTime() - start);
    }

    // setCanvasPixel(x, y, r, g, b) {
    //     this.state.ctx.clearRect(x, y, 1, 1);
    //     let single = this.state.ctx.createImageData(1, 1);
    //     single.data[0] = r;
    //     single.data[1] = g;
    //     single.data[2] = b;
    //     single.data[3] = 255;
    //     this.state.ctx.putImageData(single, x, y);
    // }

    /*
    Creates chunks in only rows, meaning the canvas has its data loaded in
    as n by 1 lines. Ensure it isn't out of bounds of the width of the canvas.
    */
    setCanvasProperty(x, y, rgbArr) {
        let ctxID = this.state.ctx.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        this.state.ctx.putImageData(ctxID, x * 10, y * 10);
    }

    setCanvas(rgbArr) {
        let ctxID = this.state.ctx.createImageData(Const.CANVAS_WIDTH, Const.CANVAS_HEIGHT);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        this.state.ctx.putImageData(ctxID, 0, 0);
    }

    render() {
        return (
            <div className='canvas'>
                <canvas ref={(canvas) => { this.canvas = canvas; }} width={Const.CANVAS_WIDTH} height={Const.CANVAS_HEIGHT}></canvas>
            </div>
        );
    }
}

export default Canvas