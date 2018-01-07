import React, { Component } from 'react'
import * as Const from '../../const/const.jsx';
import Contract from '../../contract/contract.jsx';

class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ctx: null,
        }
    }

    componentDidMount() {
        this.setState({
            ctx: this.canvas.getContext("2d")
        });

    }

    setCanvasPixel(x, y, r, g, b) {
        this.state.ctx.clearRect(x, y, 1, 1);
        let single = this.state.ctx.createImageData(1, 1);
        single.data[0] = r;
        single.data[1] = g;
        single.data[2] = b;
        single.data[3] = 255;
        this.state.ctx.putImageData(single, x, y);
    }

    /*
    Creates chunks in only rows, meaning the canvas has its data loaded in
    as n by 1 lines. Ensure it isn't out of bounds of the width of the canvas.
    */
    setCanvasChunk(x, y, rgbArr) {
        if (x + (rgbArr / 4) > Const.CANVAS_WIDTH)
            throw 'Chunk position extends outside canvas.';
        let ctxID = this.state.ctx.createImageData(rgbArr / 4, 1);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        this.state.ctx.putImageData(ctxID, x, y);
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