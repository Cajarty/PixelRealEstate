import React, { Component } from 'react'
import * as Const from '../../const/const.jsx';
import {EVENTS, ctr, Contract, LISTENERS} from '../../contract/contract.jsx';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import * as Func from '../../functions/functions.jsx';
import Axios from '../../network/Axios.jsx';
import * as Compress from 'lzwcompress';
import Zoom from './Zoom';


class ZoomCanvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ctx: null,
            dataCtx: null,
            loadValue: 0,
            cancelToken: null,
            loaded: false,
            hoverX: 0,
            hoverY: 0,
            hideCanvas: true,
            queuedUpdates: [],
        }
        this.setCanvasProperty = this.setCanvasProperty.bind(this);
    }

    componentWillReceiveProps(newProps) {
        this.drawWindow(newProps.x, newProps.y);
    }

    drawWindow(x, y) {
        if (x == -1 || y == -1) {
            this.setState({
                hideCanvas: true,
                hoverX: -1,
                hoverY: -1,
            })
            return;
        }
        this.setState({hideCanvas: false})
        if (this.state.ctx == null)
            return;
        
        //the commented out code is for snapping as grid

        let xx = Math.floor(x / 10) * 10;
        let yy = Math.floor(y / 10) * 10;
        this.state.ctx.drawImage(this.dataCanvas, Math.min(Math.max(0, xx - 20), 950), Math.min(Math.max(0, yy - 20), 950), 500, 500, 0, 0, 1000, 1000);
        this.setState({
            hoverX: Math.floor(x / 10),
            hoverY: Math.floor(y / 10),
        })
    }

    componentDidMount() {
        let ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        let dataCtx = this.dataCanvas.getContext("2d");
        dataCtx.imageSmoothingEnabled = false;
        dataCtx.webkitImageSmoothingEnabled = false;
        //ctx.scale(10, 10);
        this.setState({ ctx, dataCtx });

        ctr.listenForResults(LISTENERS.ServerDataManagerInit, 'canvasZoom', (results) => {
            if (results.imageLoaded) {
                this.setCanvas(SDM.pixelData);
                for (let i in this.state.queuedUpdates) {
                    this.setCanvasProperty(this.state.queuedUpdates[i].x, this.state.queuedUpdates[i].y, this.state.queuedUpdates[i].colors);
                }
            }
        });

        ctr.listenForEvent(EVENTS.PropertyColorUpdate, 'canvasZoom', (data) => {
            let xy = {x: 0, y: 0, colors: []};
            if (data.args.x == null || data.args.y == null)
                xy = ctr.fromID(Func.BigNumberToNumber(data.args.property));
            else {
                xy.x = data.args.x;
                xy.y = data.args.y;
            }

            if (data.args.colorsRGB == null)
                xy.colors = Func.ContractDataToRGBAArray(data.args.colors);
            else
                xy.colors = data.args.colorsRGB;

            if (this.state.canvasLoaded) 
                this.setCanvasProperty(xy.x, xy.y, Func.ContractDataToRGBAArray(data.args.colors));
            else {
                let update = this.state.queuedUpdates;
                update.push(xy);
                this.setState({queuedUpdates: update});
            }
        });
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

    render() {
        return (
            <div className={'zoomCanvasContainer ' + (this.state.hideCanvas ? 'hide' : 'show')}>
                <canvas className='dataCanvas hidden'
                    width={1000}
                    height={1000}
                    ref={(dataCanvas) => { this.dataCanvas = dataCanvas; }} 
                ></canvas>
                <canvas 
                    className='zoomCanvas' 
                    ref={(canvas) => { this.canvas = canvas; }} 
                    width={100}
                    height={100}
                ></canvas>
                <div className='location'>{'x: ' + this.state.hoverX + ' y: ' + this.state.hoverY}</div>
            </div>
        );
    }
}

export default ZoomCanvas

//<Zoom onZoom={(zoom) => this.zoomCanvas(zoom)}/>