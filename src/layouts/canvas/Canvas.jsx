import React, { Component } from 'react'
import * as Const from '../../const/const.jsx';
import {EVENTS, LISTENERS, ctr, Contract} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';
import * as Compress from 'lzwcompress';
import Zoom from './Zoom';

const FOR_SALE_IMAGE = [0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,50,52,0,255,13,13,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,4,4,0,255,122,126,0,255,196,202,0,255,173,179,0,255,68,70,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,82,84,0,255,124,128,0,255,103,106,0,255,38,40,0,255,170,175,0,255,5,5,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,78,80,0,255,146,150,0,255,111,114,0,255,32,33,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,1,1,0,255,98,101,0,255,201,207,0,255,166,171,0,255,64,66,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,102,105,0,255,58,59,0,255,176,181,0,255,38,40,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,103,106,0,255,64,66,0,255,102,105,0,255,32,33,0,255,143,147,0,255,60,61,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,21,22,0,255,176,181,0,255,184,190,0,255,168,173,0,255,163,168,0,255,5,5,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,109,112,0,255,52,54,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255];

class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ctx: null,
            loadValue: 0,
            cancelToken: null,
            loaded: false,
        }
        this.setCanvasProperty = this.setCanvasProperty.bind(this);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.pixelDataUpdateVersion > this.props.pixelDataUpdateVersion && newProps.pixelData != null) {
            this.setCanvas(newProps.pixelData);
            ctr.setupEvents();
        }
    }

    componentDidMount() {
        let ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        this.setState({ ctx });
        this.canvas.onmousemove = (e) => {          
            let rect = this.canvas.getBoundingClientRect();
            let x = (e.clientX - rect.left) * (1000 / rect.width);
            let y = (e.clientY - rect.top) * (1000 / rect.height);
            this.props.hover(x, y);
        };
        this.canvas.onmouseout = (e) => {          
            this.props.hover(-1, -1);
        };
        this.canvas.onclick = (e) => {         
            if (!e.isTrusted)
                return;
                
            let rect = this.canvas.getBoundingClientRect();
            let x = Math.floor((e.clientX - rect.left) * (1000 / rect.width) / 10);
            let y = Math.floor((e.clientY - rect.top) * (1000 / rect.height) / 10); 
            ctr.sendResults(LISTENERS.CoordinateUpdate, {x, y});
        };
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

    showPropertiesForSale() {
        let image = this.state.ctx.getImageData(0, 0, 1000, 1000);

    }

    setCanvasProperty(x, y, rgbArr) {
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
                <div className={!this.state.loaded ? '' : 'hidden'}>Loading... Please wait.</div>
            </div>
        );
    }
}

export default Canvas

//<Zoom onZoom={(zoom) => this.zoomCanvas(zoom)}/>