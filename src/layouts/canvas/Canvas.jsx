import React, { Component } from 'react'
import * as Const from '../../const/const.jsx';
import {EVENTS, ctr, Contract} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';
import Axios from '../../network/Axios.jsx';
import * as Compress from 'lzwcompress';


class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ctx: null,
            pixelData: {},
            loadValue: 0,
            cancelToken: null,
            loaded: false,
        }
        this.setCanvasProperty = this.setCanvasProperty.bind(this);
//this.appendPixelData = this.appendPixelData.bind(this);
        this.pixelData = [];
    }

    componentDidMount() {
        let ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        this.setState({ ctx });
        this.loadCanvas();
        ctr.listenForEvent(EVENTS.ColorChange, 'canvas', (data) => {
            this.setCanvasProperty(data.x, data.y, data.data);
        });
    }

    loadCanvas() {
        let cancelToken = null;
        Axios.getInstance().get('/getPixelData', cancelToken).then((result) => {
            this.setCanvas(result.data);
            ctr.setupEvents();
        });
        this.setState({cancelToken: cancelToken});
    }

    setCanvasProperty(x, y, rgbArr) {
        console.info(x, y, rgbArr);
        let ctxID = this.state.ctx.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        this.state.ctx.putImageData(ctxID, x * 10, y * 10);
    }

    setCanvas(rgbArr) {
        let ctxID = this.state.ctx.createImageData(Const.CANVAS_WIDTH, Const.CANVAS_HEIGHT);
        for (let i = 0; i < Object.keys(rgbArr).length; i++) {
            for (let j = 0; j < rgbArr[i].length; j++) {
                ctxID.data[i * rgbArr[i].length + j] = rgbArr[i][j];
            }
        }
        this.state.ctx.putImageData(ctxID, 0, 0);
        this.setState({loaded: true});
    }

    render() {
        return (
            <div className='canvas'>
                <canvas className={this.state.loaded ? '' : 'hidden'} ref={(canvas) => { this.canvas = canvas; }} width={Const.CANVAS_WIDTH} height={Const.CANVAS_HEIGHT}></canvas>
                <div className={!this.state.loaded ? '' : 'hidden'}>Loading... Please wait.</div>
            </div>
        );
    }
}

export default Canvas



/*



    componentDidMount() {
        let ctx = this.canvas.getContext("2d");
        let imageData = ctx.createImageData(Const.CANVAS_WIDTH, Const.CANVAS_HEIGHT);
        this.setState({ ctx, imageData });
        ctx.imageSmoothingEnabled = false;
        //ctr.getPropertyColors(x, y, this.appendPixelData);
        start = new Date().getTime();
        this.loadPixels(0);
    }

    loadPixels(x) {
        for(let row = 0; row < 1000; row++) {
            console.info('calls');
            ctr.getPropertyColorsOfRow(x, row, this.appendPixelData);
        }
    }

    appendPixelData(x, row, data) {
        if (this.state.pixelData[row] == null)
            this.state.pixelData[row] = [];
        for (let i = 0; i < data.length; i++)
            this.state.pixelData[row].push(data[i]);
        let loadValue = this.state.loadValue + 10;
        this.setState({loadValue});
        if (loadValue == (x + 10) * 1000 && loadValue < 100000) {
            this.completePixelDataLoad(x);
            this.loadPixels(x + 10);
        }
    }

    completePixelDataLoad(x) {
        let ctxID = this.state.ctx.createImageData(100, Const.CANVAS_HEIGHT);
        let counter = 0;
        for(let row = 0; row < 1000; row++) {
            for (let i = 0; i < 400; i++) {
                ctxID.data[counter++] = this.state.pixelData[row][i + (x * 40)];
            }
        }
        this.state.ctx.putImageData(ctxID, x * 10, 0);
        if (x >= 99) {
            console.info("Time passed: ", new Date().getTime() - start);
            console.info(this.state.pixelData);
        }
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
    /*
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

    */