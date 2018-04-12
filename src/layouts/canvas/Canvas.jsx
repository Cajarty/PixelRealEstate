import React, { Component } from 'react'
import * as Const from '../../const/const.jsx';
import {LISTENERS, ctr, Contract} from '../../contract/contract.jsx';
import * as EVENTS from '../../const/events';
import * as Func from '../../functions/functions.jsx';
import * as Compress from 'lzwcompress';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import Zoom from './Zoom';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as Assets from '../../const/assets';
import * as Struct from '../../const/structs';

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
        this.oldPointerX = -1;
        this.oldPointerY = -1;
    }
    
    componentDidMount() {
        let ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        this.setState({ ctx });
        this.canvas.onmousemove = (e) => {          
            let rect = this.canvas.getBoundingClientRect();
            let x = Math.floor((e.clientX - rect.left) * (100 / rect.width));
            if (x != GFD.getData('hoverX')) {
                GFD.setData('hoverX', x);
            }
            let y = Math.floor((e.clientY - rect.top) * (100 / rect.height)); 
            if (y != GFD.getData('hoverY')) {
                GFD.setData('hoverY', y);
            }
            this.setCanvasPointer(x, y);
        };
        this.canvas.onmouseout = (e) => {        
            GFD.setData('hoverX', -1);
            GFD.setData('hoverY', -1);
            this.setCanvasPointer(-1, -1);
            GFD.setData('pressX', -1);
            GFD.setData('pressY', -1);
            let rect = this.canvas.getBoundingClientRect();
            GFD.setData('canvasWidth', rect.width);
            GFD.setData('canvasHeight', rect.height);
        };
        this.canvas.onclick = (e) => {    
            if (!e.isTrusted)
                return;

            let rect = this.canvas.getBoundingClientRect();
            let x = Math.floor((e.clientX - rect.left) * (1000 / rect.width) / 10);
            let y = Math.floor((e.clientY - rect.top) * (1000 / rect.height) / 10); 
            GFD.setData('x', x + 1);
            GFD.setData('y', y + 1);

            if (GFD.getData('tutorialStateIndex') == 1) {
                GFD.setData('tutorialStateIndex', 1);
            }
        };
        this.canvas.onmousedown = (e) => {
            if (!e.isTrusted || e.button != 0)
                return;

            let rect = this.canvas.getBoundingClientRect();
            let x = Math.floor((e.clientX - rect.left) * (1000 / rect.width) / 10);
            let y = Math.floor((e.clientY - rect.top) * (1000 / rect.height) / 10); 
            GFD.setData('pressX', x + 1);
            GFD.setData('pressY', y + 1);
        }

        this.canvas.onmouseup = (e) => {     
            GFD.setData('pressX', -1);
            GFD.setData('pressY', -1);
        }

        if (GFD.getData('noMetaMask')) {
            GFD.listen('noMetaMask', 'canvas', this.setup);
            return;
        }
        this.setup(false);
    }

    setup(noMetaMask) {
        if (noMetaMask)
            return;
        GFD.close('noMetaMask', 'canvas');
        ctr.listenForResults(LISTENERS.ServerDataManagerInit, 'canvas', (results) => {
            if (results.imageLoaded) {
                this.setCanvasWithImage(SDM.imagePNG);
                if (GFD.getData('ServerDataManagerInit') > 1) {
                    console.info('swaety')
                    this.setState({canvasLoaded: true});
                    for (let i in this.state.queuedUpdates) {
                        this.setCanvasProperty(this.state.queuedUpdates[i].x, this.state.queuedUpdates[i].y, this.state.queuedUpdates[i].colors);
                    }
                }
            }
        })

        ctr.watchEventLogs(EVENTS.PropertyColorUpdate, {}, (handle) => {
            let eventHandle = handle;
            this.setState({eventHandle});
            eventHandle.watch((error, log) => {
                let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                let colors = Func.ContractDataToRGBAArray(log.args.colors);
                if (this.state.canvasLoaded) {
                    this.setCanvasProperty(id.x, id.y, colors);
                } else {
                    let update = this.state.queuedUpdates;
                    update.push(Struct.CondensedColorUpdate(id.x, id.y, colors));
                    this.setState({queuedUpdates: update});
                }
            });
        });

        ctr.listenForResults(LISTENERS.ShowForSale, 'Canvas', (data) => {
            if (data.show)
                this.showPropertiesForSale();
            else
                this.setCanvas(SDM.pixelData);
        })
    }

    componentWillUnmount() {
        this.state.eventHandle.stopWatching();
        ctr.stopListeningForResults(LISTENERS.ShowForSale, 'Canvas');
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

    setCanvasPointer(x, y) {
        if (x == -1 || y == -1) {
            this.colorizePointer(this.oldPointerX, this.oldPointerY, 10);
            this.oldPointerX = this.oldPointerY = -1;
            return;
        }
        if (x == this.oldPointerX && y == this.oldPointerY) {
            return;
        }
        this.colorizePointer(this.oldPointerX, this.oldPointerY, 10);
        this.colorizePointer(x, y, .1);
        this.oldPointerX = x;
        this.oldPointerY = y;
    }

    //shape vars

    colorizePointer(x, y, alpha) {
        if (x == -1 || y == -1)
            return;
        let ctxID = this.state.ctx.getImageData((x * 10) - 2, (y * 10) - 2, 14, 14);
        for (let i = 3; i < ctxID.data.length; i+=4) {
            let idx = (i - 3) / 4;
            if (idx < 28 || idx >= 168 || idx % 14 < 2 || idx % 14 >= 12) {
                ctxID.data[i] *= alpha;
            }
        }
        this.state.ctx.putImageData(ctxID, (x * 10) - 2, (y * 10) - 2);
    }

    setCanvasProperty(x, y, rgbArr) {
        let ctxID = this.state.ctx.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        this.state.ctx.putImageData(ctxID, x * 10, y * 10);
    }

    setCanvasWithImage(img) {
        this.state.ctx.drawImage(img, 0, 0);
        this.setState({loaded: true});
        let pxlData = this.state.ctx.getImageData(0, 0, Const.CANVAS_WIDTH, Const.CANVAS_HEIGHT).data;
        for (let y = 0; y < 1000; y++) {
            SDM.pixelData[y] = pxlData.slice(y * 4000, (y + 1) * 4000);
        }
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