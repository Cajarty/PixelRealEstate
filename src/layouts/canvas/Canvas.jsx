import React, { Component } from 'react'
import * as Const from '../../const/const.jsx';
import {EVENTS, LISTENERS, ctr, Contract} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';
import * as Compress from 'lzwcompress';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import Zoom from './Zoom';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as Assets from '../../const/assets';

const FOR_SALE_IMAGE = [0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,50,52,0,255,13,13,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,4,4,0,255,122,126,0,255,196,202,0,255,173,179,0,255,68,70,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,82,84,0,255,124,128,0,255,103,106,0,255,38,40,0,255,170,175,0,255,5,5,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,78,80,0,255,146,150,0,255,111,114,0,255,32,33,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,1,1,0,255,98,101,0,255,201,207,0,255,166,171,0,255,64,66,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,102,105,0,255,58,59,0,255,176,181,0,255,38,40,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,103,106,0,255,64,66,0,255,102,105,0,255,32,33,0,255,143,147,0,255,60,61,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,21,22,0,255,176,181,0,255,184,190,0,255,168,173,0,255,163,168,0,255,5,5,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,109,112,0,255,52,54,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255];

class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ctx: null,
            loadValue: 0,
            cancelToken: null,
            loaded: false,
            canvasLoaded: false,
            queuedUpdates: [],
        }
        this.setCanvasProperty = this.setCanvasProperty.bind(this);
    }
    
    componentDidMount() {
        let ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        this.setState({ ctx });
        this.canvas.onmousemove = (e) => {          
            let bodyRect = document.body.getBoundingClientRect();
            let rect = this.canvas.getBoundingClientRect();
            let x = (e.clientX - rect.left) * (1000 / rect.width);
            let y = (e.clientY - rect.top) * (1000 / rect.height);  
            GFD.setData('hoverX', x);
            GFD.setData('hoverY', y);
            GFD.setData('canvasTopOffset', rect.top - bodyRect.top); //move this and other 3 to a "on canvas resize"
            GFD.setData('canvasLeftOffset', rect.left - bodyRect.left);
            GFD.setData('canvasWidth', rect.width);
            GFD.setData('canvasHeight', rect.height);
        };
        this.canvas.onmouseout = (e) => {        
            GFD.setData('hoverX', -1);
            GFD.setData('hoverY', -1);
            // GFD.setData('pressX', -1);
            // GFD.setData('pressY', -1);
            // GFD.setData('pressTime', -1);
        };
        this.canvas.onclick = (e) => {    
            if (!e.isTrusted)
                return;

            let rect = this.canvas.getBoundingClientRect();
            let x = Math.floor((e.clientX - rect.left) * (1000 / rect.width) / 10);
            let y = Math.floor((e.clientY - rect.top) * (1000 / rect.height) / 10); 
            GFD.setData('x', x + 1);
            GFD.setData('y', y + 1);
                
            if (!GFD.getData('advancedMode') && SDM.isPropertyLoaded(x, y)) {
                ctr.getLink(SDM.getPropertyData(x, y).owner, (data) => {
                    if (data != null && data.length > 0) {
                        this.linkTag.href = data;
                        this.linkTag.click();
                    }
                });
            }
        };

        // this.canvas.onmousedown = (e) => {     
        //     if (!e.isTrusted)
        //         return;

        //     let rect = this.canvas.getBoundingClientRect();
        //     let x = Math.floor((e.clientX - rect.left) * (1000 / rect.width) / 10);
        //     let y = Math.floor((e.clientY - rect.top) * (1000 / rect.height) / 10); 
        //     GFD.setData('pressX', x + 1);
        //     GFD.setData('pressY', y + 1);
        //     GFD.setData('pressTime', new Date().getTime());
        // }

        // this.canvas.onmouseup = (e) => {     
        //     GFD.setData('pressX', -1);
        //     GFD.setData('pressY', -1);
        //     GFD.setData('pressTime', -1);
        // }

        ctr.listenForResults(LISTENERS.ServerDataManagerInit, 'canvas', (results) => {
            if (results.imageLoaded) {
                this.setState({canvasLoaded: true});
                this.setCanvas(SDM.pixelData);
                for (let i in this.state.queuedUpdates) {
                    this.setCanvasProperty(this.state.queuedUpdates[i].x, this.state.queuedUpdates[i].y, this.state.queuedUpdates[i].colors);
                }
            }
        })

        ctr.listenForEvent(EVENTS.PropertyColorUpdate, 'canvas', (data) => {
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

            if (this.state.canvasLoaded) {
                this.setCanvasProperty(xy.x, xy.y, xy.colors);
            } else {
                let update = this.state.queuedUpdates;
                update.push(xy);
                this.setState({queuedUpdates: update});
            }
        });

        ctr.listenForResults(LISTENERS.ShowForSale, 'Canvas', (data) => {
            if (data.show)
                this.showPropertiesForSale();
            else
                this.setCanvas(SDM.pixelData);
        })
    }

    showPropertiesForSale() {
        let image = this.state.ctx.getImageData(0, 0, 1000, 1000);
        for (let y = 0; y < 1000; y++) {
            for (let x = 0; x < 100; x++) {
                for (let i = 0; i < 40; i++) {
                    if (SDM.forSaleProperties[x] != null 
                        && SDM.forSaleProperties[x][Math.floor(y / 10)] != null 
                        && SDM.forSaleProperties[x][Math.floor(y / 10)].isForSale) {
                            image.data[y * 4000 + x * 40 + i] = FOR_SALE_IMAGE[y % 10 * 40 + i];
                    } else {
                    //apply alpha
                    if (i % 4 == 3)
                        image.data[y * 4000 + x * 40 + i] = 128;
                    }
                }
            }
        }
        this.state.ctx.putImageData(image, 0, 0);
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
                <div className={!this.state.loaded ? 'loading' : 'hidden'}>
                    <img className='icon' src={Assets.LOADING} draggable={false}></img>
                </div>
                <a target='_blank' ref={(linkTag) => {this.linkTag = linkTag}} style={{display: 'hidden'}}></a>
            </div>
        );
    }
}

export default Canvas

//<Zoom onZoom={(zoom) => this.zoomCanvas(zoom)}/>