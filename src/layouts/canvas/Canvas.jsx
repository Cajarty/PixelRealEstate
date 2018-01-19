import React, { Component } from 'react'
import * as Const from '../../const/const.jsx';
import {EVENTS, ctr, Contract} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';
import Axios from '../../network/Axios.jsx';
import * as Compress from 'lzwcompress';
import Zoom from './Zoom';


class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ctx: null,
            pixelData: {},
            loadValue: 0,
            currentZoom: 1,
            cancelToken: null,
            loaded: false,
        }
        this.setCanvasProperty = this.setCanvasProperty.bind(this);
        this.zoomCanvas = this.zoomCanvas.bind(this);
//this.appendPixelData = this.appendPixelData.bind(this);
        this.pixelData = [];
    }

    componentDidMount() {
        let dataCtx = this.dataCanvas.getContext("2d");
        dataCtx.imageSmoothingEnabled = false;
        dataCtx.webkitImageSmoothingEnabled = false;
        let ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        this.setState({ dataCtx, ctx });
        this.loadCanvas();
        ctr.listenForEvent(EVENTS.PropertyColorUpdate, 'canvas', (data) => {
            let xy = {x: 0, y: 0};
            if (data.args.x == null || data.args.y == null)
                xy = ctr.fromID(Func.BigNumberToNumber(data.args.property));
            else {
                xy.x = data.args.x;
                xy.y = data.args.y;
            }
            if (data.args.colorsRGB == null)
                this.setCanvasProperty(xy.x, xy.y, Func.ContractDataToRGBAArray(data.args.colors));
            else
                this.setCanvasProperty(xy.x, xy.y, data.args.colorsRGB);
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
        let ctxID = this.state.dataCtx.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        this.state.dataCtx.putImageData(ctxID, x * 10, y * 10);
    }

    setCanvas(rgbArr) {
        let ctxID = this.state.dataCtx.createImageData(Const.CANVAS_WIDTH, Const.CANVAS_HEIGHT);
        for (let i = 0; i < Object.keys(rgbArr).length; i++) {
            for (let j = 0; j < rgbArr[i].length; j++) {
                ctxID.data[i * rgbArr[i].length + j] = rgbArr[i][j];
            }
        }
        this.state.dataCtx.putImageData(ctxID, 0, 0);
        this.setState({loaded: true});
    }

    zoomCanvas(zoom) {
        this.state.ctx.scale(zoom / this.state.currentZoom, zoom / this.state.currentZoom);
        this.state.ctx.drawImage(this.dataCanvas, 0, 0);
        this.setState({currentZoom: zoom});
    }

    render() {
        return (
            <div className='canvasContainer'>
                <canvas className='dataCanvas hidden'
                    width={1000}
                    height={1000}
                    ref={(dataCanvas) => { this.dataCanvas = dataCanvas; }} 
                ></canvas>
                <canvas 
                    className={'canvas zoom-6 ' + (this.state.loaded ? '' : 'hidden')} 
                    ref={(canvas) => { this.canvas = canvas; }} 
                    width={Const.CANVAS_WIDTH} 
                    height={Const.CANVAS_HEIGHT}
                ></canvas>
                <Zoom onZoom={(zoom) => this.zoomCanvas(zoom)}/>
                <div className={!this.state.loaded ? '' : 'hidden'}>Loading... Please wait.</div>
            </div>
        );
    }
}

export default Canvas