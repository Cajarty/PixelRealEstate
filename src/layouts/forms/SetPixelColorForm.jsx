import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';
import * as Const from '../../const/const.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import { ChromePicker } from 'react-color';
import * as Assets from '../../const/assets';

const PREVIEW_WIDTH = 100;
const PREVIEW_HEIGHT = 100;

const DrawMode = {
    PIXEL: 0,
    FILL: 1,
    PICK: 2,
    ERASE: 3,
};

class SetPixelColorForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
            ppt: '0',
            ctxLrg: null,
            ctxSml: null,
            imageData: null,
            drawColor: {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 255,
                  },
            drawMode: DrawMode.PIXEL,
        };
    }
    
    componentWillReceiveProps(newProps) {
        let update = {};
        Object.keys(newProps).map((i) => {
            if (newProps[i] != this.props[i]) {
                update[i] = newProps[i];
            }
        });
        this.setState(update);
    }

    componentWillUnmount() {
        GFD.closeAll('UpdatePixel');
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
    }

    handlePrice(key, value) {
        let obj = {};
        obj[key] = parseInt(value) < 0 ? 0 : parseInt(value);
        this.setState(obj);
    }

    componentDidMount() {
        let ctxLrg = this.canvasLrg.getContext("2d");
        let ctxSml = this.canvasSml.getContext("2d");
        ctxLrg.imageSmoothingEnabled = false;
        ctxSml.imageSmoothingEnabled = false;
        this.canvasLrg.onmousedown = this.canvasLrg.onmouseenter = (ev) => {
            if (ev.buttons == 0 || ev.button != 0)
                return;
            this.setState({mousePressed: true});
            this.attemptDraw(ev);
        };
        this.canvasLrg.onmouseup = this.canvasLrg.onmouseleave = (ev) => {
            this.setState({mousePressed: false});
        };
        this.canvasLrg.onmousemove = (ev) => {
            if (this.state.mousePressed)
                this.attemptDraw(ev);
        };
        this.setState({
            ctxLrg, 
            ctxSml,
        });
        GFD.listen('x', 'UpdatePixel', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'UpdatePixel', (y) => {
            this.setState({y});
        })
        this.drawImages();
    }

    attemptDraw(ev) {
        if (!ev.isTrusted)
                return;
            
        let pixelClick = {
            x: Math.floor(ev.offsetX / 10), 
            y: Math.floor(ev.offsetY / 10), 
        };

        switch(this.state.drawMode) {
            case DrawMode.PIXEL:
                return this.drawPixel(pixelClick.x, pixelClick.y);
            case DrawMode.FILL:
                return this.drawFill();
            case DrawMode.PICK:
                return this.pickPixelColor(pixelClick.x, pixelClick.y);
            case DrawMode.ERASE:
                return this.erasePixel(pixelClick.x, pixelClick.y);
            default:
                return;
        }
    }

    pickPixelColor(x, y) {
        let pixelData = this.state.ctxSml.getImageData(x, y, 1, 1);
        let p = {
            r: pixelData.data[0],
            g: pixelData.data[1],
            b: pixelData.data[2],
            a: 1,
        };
        this.setState({
            drawColor: p,
            drawMode: DrawMode.PIXEL
        });
    }

    erasePixel(x, y) {
        let ctxID = this.state.ctxLrg.createImageData(10, 10);
        for (let i = 0; i < 400; i++) {
            ctxID.data[i] = 0;
        }
        this.state.ctxLrg.putImageData(ctxID, x * 10, y * 10);
        this.state.ctxSml.putImageData(ctxID, x, y, 0, 0, 1, 1);

        this.setState({
            imageData: this.state.ctxSml.getImageData(0, 0, Const.PROPERTY_LENGTH, Const.PROPERTY_LENGTH).data,
        });
    }

    drawPixel(x, y) {
        let ctxID = this.state.ctxLrg.createImageData(10, 10);
        for (let i = 0; i < 400; i+=4) {
            ctxID.data[i] = this.state.drawColor.r;
            ctxID.data[i+1] = this.state.drawColor.g;
            ctxID.data[i+2] = this.state.drawColor.b;
            ctxID.data[i+3] = this.state.drawColor.a * 255;
        }
        this.state.ctxLrg.putImageData(ctxID, x * 10, y * 10);
        this.state.ctxSml.putImageData(ctxID, x, y, 0, 0, 1, 1);

        this.setState({
            imageData: this.state.ctxSml.getImageData(0, 0, Const.PROPERTY_LENGTH, Const.PROPERTY_LENGTH).data,
        });
    }

    drawFill() {
        let ctxID = this.state.ctxLrg.createImageData(100, 100);
        for (let i = 0; i < 40000; i+=4) {
            ctxID.data[i] = this.state.drawColor.r;
            ctxID.data[i+1] = this.state.drawColor.g;
            ctxID.data[i+2] = this.state.drawColor.b;
            ctxID.data[i+3] = this.state.drawColor.a * 255;
        }
        this.state.ctxLrg.putImageData(ctxID, 0, 0);
        this.state.ctxSml.putImageData(ctxID, 0, 0, 0, 0, 10, 10);

        this.setState({
            imageData: this.state.ctxSml.getImageData(0, 0, Const.PROPERTY_LENGTH, Const.PROPERTY_LENGTH).data,
        });
    }

    colorChange(color, event) {
        this.setState({drawColor: color.rgb});
    }

    changeTool(tool) {
        this.setState({drawMode: tool});
    }

    uploadImage(e) {
        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        if (files.length < 1)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            let img = new Image();
            img.onload = () => {
                this.drawImages(img);
            }
            img.src = event.target.result;
        };
        reader.readAsDataURL(files[0]);
    }

    drawImages(img) {
        if (img == null) 
            return;

        this.state.ctxLrg.drawImage(img, 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
        this.state.ctxSml.drawImage(img, 0, 0, Const.PROPERTY_LENGTH, Const.PROPERTY_LENGTH);

        this.setState({
            imageData: this.state.ctxSml.getImageData(0, 0, Const.PROPERTY_LENGTH, Const.PROPERTY_LENGTH).data,
        });
    }

    setPixels() {
        ctr.setColors(this.state.x - 1, this.state.y - 1, this.state.imageData, this.state.ppt);
    }

    render() {
        return (
            <table cellSpacing={0} cellPadding={0} className='SetPixelColorForm form'>
                <tbody>
                    <tr>
                        <td colSpan={2}>
                            <div className='title'>
                                Change Property Image:
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <canvas id='large' width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} ref={(canvasLrg) => { this.canvasLrg = canvasLrg; }}></canvas>
                        </td>
                        <td>
                            <canvas id='normal' width={Const.PROPERTY_LENGTH} height={Const.PROPERTY_LENGTH} ref={(canvasSml) => { this.canvasSml = canvasSml; }}></canvas>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <div className={'toolButton ' + (this.state.drawMode === DrawMode.PIXEL ? 'active' : '')} onClick={() => this.changeTool(DrawMode.PIXEL)} >
                                <img className='icon' src={Assets.PENCIL} draggable={false}></img>
                            </div>
                            <div className={'toolButton ' + (this.state.drawMode === DrawMode.FILL ? 'active' : '')} onClick={() => this.changeTool(DrawMode.FILL)} >
                                <img className='icon' src={Assets.BUCKET} draggable={false}></img>
                            </div>
                            <div className={'toolButton ' + (this.state.drawMode === DrawMode.PICK ? 'active' : '')} onClick={() => this.changeTool(DrawMode.PICK)} >
                                <img className='icon' src={Assets.DROPPER} draggable={false}></img>
                            </div>
                            <div className={'toolButton ' + (this.state.drawMode === DrawMode.ERASE ? 'active' : '')} onClick={() => this.changeTool(DrawMode.ERASE)} >
                                <img className='icon' src={Assets.ERASE} draggable={false}></img>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <ChromePicker 
                                className='colorPicker' 
                                onChangeComplete={(color, event) => this.colorChange(color, event)}
                                color={this.state.drawColor}
                                disableAlpha={true}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> X: </div>
                        </td>
                        <td>
                            <input 
                                id='xInput' 
                                type='number' 
                                placeholder='1-100'
                                onChange={(e) => this.setX(e.target.value)} 
                                value={this.state.x}
                            ></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Y: </div>
                        </td>
                        <td>
                            <input 
                                id='yInput' 
                                type='number'
                                placeholder='1-100'
                                onChange={(e) => this.setY(e.target.value)} 
                                value={this.state.y}
                            ></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Tokens: </div>
                        </td>
                        <td>
                            <input id='tokens' type='number' onChange={(e) => this.handlePrice('ppt', e.target.value)} value={this.state.ppt}></input>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <input 
                                id='imageInput' 
                                type='file' 
                                onChange={(e) => this.uploadImage(e)} 
                                style={{display: 'none'}} 
                                ref={(input) => { this.input = input; }}
                            ></input>
                            <input 
                                id='imageInputButton' 
                                value='Upload Image' 
                                type='button' 
                                onClick={(e) => {this.input.click()}}
                            ></input>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <input type='button' value='Change Image' onClick={() => this.setPixels()}></input>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default SetPixelColorForm