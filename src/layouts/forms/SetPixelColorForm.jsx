import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';
import * as Const from '../../const/const.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import { ChromePicker } from 'react-color';
import * as Assets from '../../const/assets';
import Info from '../ui/Info';
import * as Strings from '../../const/strings';
import { Modal, ModalContent, ModalHeader, Button, Divider, Input, Popup, Label, ModalActions, Icon, Segment, Grid, GridColumn, GridRow, ButtonGroup, Message } from 'semantic-ui-react';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager';
import {TUTORIAL_STATE} from '../../functions/GlobalState';

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
            canvasLrg: null,
            canvasSml: null,
            imageData: null,
            drawColor: {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 255,
                  },
            drawMode: DrawMode.PIXEL,
            isOpen: false,
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

    componentDidUnmountOpen() {
        GFD.closeAll('UpdatePixel');
        this.state.canvasLrg.onmousedown = null;
        this.state.canvasLrg.onmouseup = null;
        this.state.canvasLrg.onmousemove = null;
        this.setState({
            ctxLrg: null,
            ctxSml: null,
            canvasLrg: null,
            canvasSml: null,
        })
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

    componentDidMountOpen() {
        let canvasLrg = document.querySelector('canvas#large');
        let canvasSml = document.querySelector('canvas#normal');
        if (canvasLrg == null || canvasSml == null)
            return;
        let ctxLrg = canvasLrg.getContext("2d");
        let ctxSml = canvasSml.getContext("2d");
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
            canvasLrg,
            canvasSml
        });
        GFD.listen('x', 'UpdatePixel', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'UpdatePixel', (y) => {
            this.setState({y});
        })
        this.setCanvas(SDM.getPropertyImage(GFD.getData('x') - 1, GFD.getData('y') - 1), ctxSml, ctxLrg, canvasSml);
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
                return this.drawFill(pixelClick.x, pixelClick.y);
            case DrawMode.PICK:
                return this.pickPixelColor(pixelClick.x, pixelClick.y);
            case DrawMode.ERASE:
                return this.erasePixel(pixelClick.x, pixelClick.y);
            default:
                return;
        }
    }

    setCanvas(rgbArr, ctxSml = this.state.ctxSml, ctxLrg = this.state.ctxLrg, canvasSml = this.state.canvasSml) {
        let ctxID = ctxSml.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        ctxSml.putImageData(ctxID, 0, 0);
        ctxLrg.drawImage(canvasSml, 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);

        this.setState({
            imageData: ctxSml.getImageData(0, 0, Const.PROPERTY_LENGTH, Const.PROPERTY_LENGTH).data,
        });
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

    //Old "Fill" that filled the whole Property with one color. Still may be useful as a UI item if properly name
    drawClearToColor() {
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

    drawFill(x, y) {
        let colorToReplace = this.state.ctxSml.getImageData(x, y, 1, 1);
        let visitedPoints  = [];
        let pointsToCheck = [ {x: x, y : y} ];

        let ifReplaceColor = function(colorToCheck) {
            return colorToReplace.data[0] == colorToCheck.data[0] && colorToReplace.data[1] == colorToCheck.data[1] && colorToReplace.data[2] == colorToCheck.data[2];
        }

        let pointIsUnvisited = function(xToCheck, yToCheck) {
            for (let i = 0 ; i < visitedPoints.length; ++i)
                if (visitedPoints[i]["x"] === xToCheck && visitedPoints[i]["y"] === yToCheck)
                    return false;
            return true;
        }

        let tryAddPointToCheck = function(xToCheck, yToCheck) {
            if (xToCheck >= 0 && yToCheck >= 0 && xToCheck <= 9 && yToCheck <= 9 && pointIsUnvisited(xToCheck, yToCheck) ) {
                pointsToCheck.push( {x : xToCheck, y : yToCheck });
            }
        }

        let updateColor = function(xToChange, yToChange, state) {
            let ctxID = state.ctxLrg.createImageData(10, 10);
            for (let i = 0; i < 400; i+=4) {
                ctxID.data[i] = state.drawColor.r;
                ctxID.data[i+1] = state.drawColor.g;
                ctxID.data[i+2] = state.drawColor.b;
                ctxID.data[i+3] = state.drawColor.a * 255;
            }
            state.ctxLrg.putImageData(ctxID, xToChange * 10, yToChange * 10);
            state.ctxSml.putImageData(ctxID, xToChange, yToChange, 0, 0, 1, 1);
        }

        while(pointsToCheck.length != 0) {
            let pointToCheck = pointsToCheck.pop();
            let xToCheck = pointToCheck["x"];
            let yToCheck = pointToCheck["y"];
            let currentRGB = this.state.ctxSml.getImageData(xToCheck, yToCheck, 1, 1);

            if (pointIsUnvisited(xToCheck, yToCheck)) {
                visitedPoints.push(pointToCheck);
                if (ifReplaceColor(currentRGB)) {
                    tryAddPointToCheck(xToCheck - 1, yToCheck);
                    tryAddPointToCheck(xToCheck + 1, yToCheck);
                    tryAddPointToCheck(xToCheck, yToCheck - 1);
                    tryAddPointToCheck(xToCheck, yToCheck + 1);
                    updateColor(xToCheck, yToCheck, this.state);
                }
            }
        }

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
        ctr.setColors(this.state.x - 1, this.state.y - 1, this.state.imageData, this.state.ppt, (result) => {
            this.toggleModal(!result);
        });
    }

    toggleModal(set = null) {
        let res = set != null ? set : !this.state.isOpen;
        this.setState({isOpen: res});
        this.props.close("SET_IMAGE");
    }

    clearCanvas() {
        let ctxID = this.state.ctxLrg.createImageData(100, 100);
        for (let i = 0; i < 40000; i++) {
            ctxID.data[i] = 0;
        }
        this.state.ctxLrg.putImageData(ctxID, 0, 0);
        this.state.ctxSml.putImageData(ctxID, 0, 0, 0, 0, 10, 10);

        this.setState({
            imageData: this.state.ctxSml.getImageData(0, 0, Const.PROPERTY_LENGTH, Const.PROPERTY_LENGTH).data,
        });
    }

    loadCanvas() {
        this.setCanvas(SDM.getPropertyImage(this.state.x - 1, this.state.y - 1), this.state.ctxSml, this.state.ctxLrg, this.state.canvasSml);
    }

    componentDidUpdate(pP, pS) {
        if (this.state.isOpen && !pS.isOpen)
            this.componentDidMountOpen();
        else if (!this.state.isOpen && pS.isOpen)
            this.componentDidUnmountOpen();
    }

    render() {
        return (
            <Modal size='small'
                open={this.state.isOpen || this.props.tutorialState.index == 4} 
                closeIcon={this.props.tutorialState.index != 4}
                dimmer={this.props.tutorialState.index != 4}
                onClose={() => this.toggleModal(false)}
                className={TUTORIAL_STATE.getClassName(this.props.tutorialState.index, 4) + ' actions'}
            >
            <ModalHeader>Update Property Image</ModalHeader>
            <ModalContent>
                <Info messages={Strings.FORM_SET_IMAGE}/>
                <Divider/>
                <Segment>
                    <Grid>
                        <GridRow columns='two' stretched>
                            <GridColumn width={9}>
                                <Segment>
                                <Grid divided>
                                    <GridRow columns='two'>
                                        <GridColumn width={10}>
                                            <canvas id='large' width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} ref={(canvasLrg) => { this.canvasLrg = canvasLrg; }}></canvas>
                                        </GridColumn>
                                        <GridColumn width={6}>
                                            <canvas id='normal' width={Const.PROPERTY_LENGTH} height={Const.PROPERTY_LENGTH} ref={(canvasSml) => { this.canvasSml = canvasSml; }}></canvas>
                                        </GridColumn>
                                    </GridRow>
                                    <GridRow>
                                        <GridColumn width={10}>
                                            <ButtonGroup fluid>
                                                <Popup 
                                                trigger={
                                                    <Button 
                                                        icon 
                                                        active={this.state.drawMode === DrawMode.PIXEL ? true : false}
                                                        onClick={() => this.changeTool(DrawMode.PIXEL)}
                                                    ><Icon name='pencil'/></Button>
                                                }
                                                content='Pencil Tool'
                                                position='bottom left'
                                                className='Popup'
                                                size='tiny'
                                                basic
                                                />
                                                <Popup 
                                                trigger={
                                                    <Button 
                                                        icon
                                                        active={this.state.drawMode === DrawMode.FILL ? true : false}
                                                        onClick={() => this.changeTool(DrawMode.FILL)}
                                                    ><Icon name='maximize'/></Button>
                                                }
                                                content='Fill Tool'
                                                position='bottom left'
                                                className='Popup'
                                                size='tiny'
                                                basic
                                                />
                                                <Popup 
                                                trigger={
                                                    <Button 
                                                        icon name='eyedropper' 
                                                        active={this.state.drawMode === DrawMode.PICK ? true : false}
                                                        onClick={() => this.changeTool(DrawMode.PICK)}
                                                    ><Icon name='eyedropper'/></Button>
                                                }
                                                content='Color Picker Tool'
                                                position='bottom left'
                                                className='Popup'
                                                size='tiny'
                                                basic
                                                />
                                                <Popup 
                                                trigger={
                                                    <Button 
                                                        icon
                                                        active={this.state.drawMode === DrawMode.ERASE ? true : false}
                                                        onClick={() => this.changeTool(DrawMode.ERASE)}
                                                    ><Icon name='erase'/></Button>
                                                }
                                                content='Eraser Tool'
                                                position='bottom left'
                                                className='Popup'
                                                size='tiny'
                                                basic
                                                />
                                                </ButtonGroup>
                                            </GridColumn>
                                            <GridColumn width={6}>
                                            <ButtonGroup fluid>
                                                <Popup 
                                                    trigger={
                                                        <Button icon
                                                            onClick={(e) => {this.clearCanvas()}}
                                                        ><Icon name='trash outline'/></Button>
                                                    }
                                                    content='Clear drawing canvas'
                                                    position='bottom left'
                                                    className='Popup'
                                                    size='tiny'
                                                    basic
                                                />
                                                <Popup 
                                                    trigger={
                                                        <Button icon
                                                            onClick={(e) => {this.loadCanvas()}}
                                                        ><Icon name='cloud upload'/></Button>
                                                    }
                                                    content='Load current image'
                                                    position='bottom left'
                                                    className='Popup'
                                                    size='tiny'
                                                    basic
                                                />
                                            </ButtonGroup>
                                        </GridColumn>
                                    </GridRow>
                                    <GridRow>
                                        <GridColumn width={10}>
                                        </GridColumn>
                                        <GridColumn width={6}>
                                            <input 
                                                id='imageInput' 
                                                type='file' 
                                                onChange={(e) => this.uploadImage(e)} 
                                                style={{display: 'none'}} 
                                                ref={(input) => { this.input = input; }}
                                            ></input>
                                            <Popup 
                                                trigger={
                                                    <Button 
                                                        fluid
                                                        id='imageInputButton' 
                                                        type='button' 
                                                        onClick={(e) => {this.input.click()}}
                                                    ><Icon name='upload'/></Button>
                                                }
                                                content='Upload from file...'
                                                position='bottom left'
                                                className='Popup'
                                                size='tiny'
                                                basic
                                            />
                                        </GridColumn>
                                    </GridRow>
                                </Grid>
                                </Segment>
                            </GridColumn>
                            <GridColumn width={7}>
                                <Segment>
                                    <ChromePicker 
                                        className='colorPicker' 
                                        onChangeComplete={(color, event) => this.colorChange(color, event)}
                                        color={this.state.drawColor}
                                        disableAlpha={true}
                                    />
                                </Segment>
                            </GridColumn>
                        </GridRow>
                    </Grid>
                </Segment>
                <Divider/>
                <Grid divided>
                    <GridRow verticalAlign='middle'>
                        <GridColumn width={4}>
                            <Input
                                placeholder="1 - 100"
                                type="number"
                                className='oneColumnFull'
                                fluid
                                label={<Popup
                                    trigger={<Label className='uniform'>X</Label>}
                                    content='X Position'
                                    className='Popup'
                                    size='tiny'
                                />}
                                value={this.state.x} 
                                onChange={(e) => this.setX(e.target.value)}
                            />
                            </GridColumn>
                        <GridColumn width={4}>
                            <Input
                                placeholder="1 - 100"
                                type="number"
                                label={<Popup
                                    trigger={<Label className='uniform'>Y</Label>}
                                    content='Y Position'
                                    className='Popup'
                                    size='tiny'
                                />}
                                className='oneColumnFull'
                                fluid
                                value={this.state.y} 
                                onChange={(e) => this.setY(e.target.value)}
                            />
                        </GridColumn>
                        <GridColumn width={8}>
                            <Input 
                                fluid
                                labelPosition='right' 
                                type={"number"}
                                placeholder={"Enter Optional PXL"}
                                value={this.state.ppt}
                            >
                                <Popup
                                    trigger={<Label><Icon className='uniform' name='money'/></Label>}
                                    content='PXL to Spend'
                                    className='Popup'
                                    size='tiny'
                                />
                                <input 
                                className='bid'
                                onChange={(e) => this.handlePrice('ppt', e.target.value)}
                                />
                                <Label>PXL</Label>
                            </Input>
                        </GridColumn>
                    </GridRow>
                </Grid>
                </ModalContent>
                {this.props.tutorialState.index != 4 && <ModalActions>
                    <Button primary onClick={() => this.setPixels()}>Change Image</Button>
                </ModalActions>}
            </Modal>
        );
    }
}

export default SetPixelColorForm