import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';
import * as Const from '../../const/const.jsx';

const PREVIEW_WIDTH = 100;
const PREVIEW_HEIGHT = 100;

class SetPixelColorForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            valueX: 0,
            valueY: 0,
            ctxLrg: null,
            ctxSml: null,
            imageData: null,
        };
    }

    componentDidMount() {
        let ctxLrg = this.canvasLrg.getContext("2d");
        let ctxSml = this.canvasSml.getContext("2d");
        ctxLrg.imageSmoothingEnabled = false;
        ctxSml.imageSmoothingEnabled = false;
        this.setState({ctxLrg, ctxSml });
    }

    handleInput(key, event) {
        let obj = {};
        obj[key] = parseInt(event.target.value);
        this.setState(obj);
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
                this.state.ctxLrg.drawImage(img, 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
                this.state.ctxSml.drawImage(img, 0, 0, Const.PROPERTY_LENGTH, Const.PROPERTY_LENGTH);
                this.setState({
                    imageData: this.state.ctxSml.getImageData(0, 0, Const.PROPERTY_LENGTH, Const.PROPERTY_LENGTH).data,
                });
            }
            img.src = event.target.result;
        };
        reader.readAsDataURL(files[0]);
    }

    sendColors() {
        ctr.setColors(this.state.valueX, this.state.valueY, this.state.imageData);
    }

    render() {
        return (
            <table className='form'>
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
                        <td>
                            <div className='inputTitle'> X: </div>
                        </td>
                        <td>
                            <input id='xInput' type='number' onChange={(e) => this.handleInput('valueX', e)} value={this.state.valueX}></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Y: </div>
                        </td>
                        <td>
                            <input id='yInput' type='number' onChange={(e) => this.handleInput('valueY', e)} value={this.state.valueY}></input>
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
                            <input type='button' value='Change Image' onClick={() => this.sendColors()}></input>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default SetPixelColorForm