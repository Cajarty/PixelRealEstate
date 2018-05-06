import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import { Slider } from 'react-semantic-ui-range';
import * as Strings from '../../const/strings';
import * as Const from '../../const/const';
import * as Assets from '../../const/assets';
import Info from '../ui/Info';
import {TUTORIAL_STATE} from '../../functions/GlobalState';
import {Divider, ModalDescription, Input, Image, Popup, Grid, Label, Modal, ModalHeader, ModalContent, ModalActions, Button, FormInput, LabelDetail, Icon, Segment, Message, GridColumn, GridRow } from 'semantic-ui-react';
import PXLBalanceItem from '../ui/PXLBalanceItem';
import * as EVENTS from '../../const/events';
var GIFEncoder = require('gifencoder');
const save = require('save-file')

class ViewTimelapse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startBlock: 5538829,
            endBlock: 5538830,
            blockFrom: 5538829, //ethereum block #
            blockTo: 0, //ethereum block #
            frameDelay: 250, //milliseconds
            x1: 1, //1 to 100 of start X size.
            x2: 100,
            y1: 1,
            y2: 100,
            gifLoading: 0, //0 to 1 of gifLoaded
            gif: null, //the gif
            gifCanvasCtx: null, //the ctx of the canvas used to make the gif
        };
    }

    componentDidMount() {
        ctr.getCurrentBlock((error, block) => {
            this.setState({
                blockTo: block.number,
                blockFrom: block.number - 1000,
                endBlock: block.number,
            });
        });
    }

    buildGIF() {
        let ctx = this.gifCanvas.getContext("2d");
        let x1 = this.state.x1;
        let y1 = this.state.y1;
        let x2 = this.state.x2;
        let y2 = this.state.y2;
        let w = Math.abs(this.state.x2 - this.state.x1) + 1;
        let h = Math.abs(this.state.y2 - this.state.y1) + 1;
        ctx.canvas.width = w * 10;
        ctx.canvas.height = h * 10;
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        this.setState({ gifCanvasCtx: ctx });

        let GIF = new GIFEncoder(w * 10, h * 10);
        GIF.setDelay(this.state.frameDelay);
        GIF.setRepeat(0);

        ctr.getEventLogs(EVENTS.PropertyColorUpdate, {}, (error, preLogs) => {
            
            let preLogsLength = Object.keys(preLogs).length;
            for (let i = 0; i < preLogsLength; i++) {
                let id = ctr.fromID(Func.BigNumberToNumber(preLogs[i].args.property));
                if (id.x < x1 || id.y < y1 || id.x > x2 - 1 || id.y > y2 - 1)
                    continue;
                this.addFrame(ctx, id.x - (x1 - 1), id.y - (y1 - 1), Func.ContractDataToRGBAArray(preLogs[i].args.colors));
            }


            ctr.getEventLogs(EVENTS.PropertyColorUpdate, {}, (error, logs) => {
                let logsLength = Object.keys(logs).length;
                if (logsLength < 1)
                    return;
                GIF.start();
                for (let i = 0; i < logsLength; i++) {
                    let id = ctr.fromID(Func.BigNumberToNumber(logs[i].args.property));
                    this.setState({gifLoading: (i + 1) / logsLength});
                    if (id.x > x2 - 1 || id.y > y2 - 1)
                        continue;
                    this.addFrame(ctx, id.x - (x1 - 1), id.y - (y1 - 1), Func.ContractDataToRGBAArray(logs[i].args.colors));
                    GIF.addFrame(ctx);
                }

                GIF.finish();

                save(GIF.out.getData(), 'timelapse.gif', (err, data) => {
                    if (err) throw err;
                })

            }, this.state.blockFrom, this.state.blockTo);
        }, this.state.startBlock, this.state.blockFrom - 1);
    }

    addFrame(ctx, x, y, rgbArr) {
        let ctxID = ctx.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        ctx.putImageData(ctxID, x * 10, y * 10);
    }

    downloadGIF() {

    }

    setSingleState(key, value, min = 0, max = 2147483647) {
        let update = this.state;
        update[key] = Math.min(Math.max(min, value), max);
        this.setState(update);
    }

    render() {
        const blocks = this.state.blockTo - this.state.blockFrom;
        const load = this.state.gifLoading;
        return (
            <Modal size='small' 
                open={this.state.isOpen} 
                closeIcon 
                trigger={<Button fluid>View Timelapse</Button>}
                onClose={() => this.toggleModal(false)}
            >
            <ModalHeader>View Timelapse</ModalHeader>
            <ModalContent>
                <canvas className='dataCanvas hidden'
                    width={1000}
                    height={1000}
                    ref={(gifCanvas) => { this.gifCanvas = gifCanvas; }} 
                ></canvas>
                <Grid>
                    <GridRow>
                        <GridColumn width={8}>
                            <div className='gif text'>
                                {load <= 0 && 'Click "Build GIF" to create a timelapse.'}
                                {load > 0 && load < 100 && 'GIF is building... (' + Math.round(load * 100) + '%)'}
                            </div>
                            <Image className='gif image' size='large' src={this.state.gifLoading >= 1 ? this.state.gif : Assets.PLACEHOLDER_GIF}/>
                        </GridColumn>
                        <GridColumn className='gif' width={8}>
                        <Grid stretched compact>
                            <GridRow>
                                <GridColumn width={16}>
                                    <Input
                                        placeholder='Block From'
                                        type="number"
                                        label={<Popup
                                            trigger={<Label>From</Label>}
                                            content='Block # to start from'
                                            className='Popup'
                                            size='tiny'
                                        />}
                                        fluid
                                        value={this.state.blockFrom === 0 ? '' : this.state.blockFrom} 
                                        onChange={(e) => this.setSingleState('blockFrom', e.target.value)}
                                    />
                                </GridColumn>
                            </GridRow>
                            <GridRow>
                                <GridColumn width={16}>
                                    <Input
                                        placeholder='Block To'
                                        type="number"
                                        label={<Popup
                                            trigger={<Label>To</Label>}
                                            content='Block # to end at'
                                            className='Popup'
                                            size='tiny'
                                        />}
                                        fluid
                                        value={this.state.blockTo === 0 ? '' : this.state.blockTo} 
                                        onChange={(e) => this.setSingleState('blockTo', e.target.value)}
                                    />
                                </GridColumn>
                            </GridRow>
                            <GridRow>
                                = {blocks} blocks ({Func.TimeSince(new Date().getTime() - (blocks * 14000))}).
                            </GridRow>
                            <GridRow>
                                <GridColumn width={16}>
                                    <Input
                                        placeholder='Frame Delay (ms)'
                                        type="number"
                                        label={<Popup
                                            trigger={<Label>Frame Delay</Label>}
                                            content='Milliseconds between each frame'
                                            className='Popup'
                                            size='tiny'
                                        />}
                                        fluid
                                        value={this.state.frameDelay === 0 ? '' : this.state.frameDelay} 
                                        onChange={(e) => this.setSingleState('frameDelay', e.target.value, 0, 60000)}
                                    />
                                </GridColumn>
                            </GridRow>
                            <GridRow>
                                <GridColumn width={8}>
                                    <Input
                                        placeholder='X1'
                                        type="number"
                                        label={<Popup
                                            trigger={<Label>X1</Label>}
                                            content='Left crop side'
                                            className='Popup'
                                            size='tiny'
                                        />}
                                        fluid
                                        value={this.state.x1 === 0 ? '' : this.state.x1} 
                                        onChange={(e) => this.setSingleState('x1', e.target.value)}
                                    />
                                </GridColumn>
                                <GridColumn width={8}>
                                    <Input
                                        placeholder='Y1'
                                        type="number"
                                        label={<Popup
                                            trigger={<Label>Y1</Label>}
                                            content='Top crop side'
                                            className='Popup'
                                            size='tiny'
                                        />}
                                        fluid
                                        value={this.state.y1 === 0 ? '' : this.state.y1} 
                                        onChange={(e) => this.setSingleState('y1', e.target.value)}
                                    />
                                </GridColumn>
                            </GridRow>
                            <GridRow>
                                <GridColumn width={8}>
                                    <Input
                                        placeholder='X2'
                                        type="number"
                                        label={<Popup
                                            trigger={<Label>X2</Label>}
                                            content='Right crop side'
                                            className='Popup'
                                            size='tiny'
                                        />}
                                        fluid
                                        value={this.state.x2 === 0 ? '' : this.state.x2} 
                                        onChange={(e) => this.setSingleState('x2', e.target.value)}
                                    />
                                </GridColumn>
                                <GridColumn width={8}>
                                    <Input
                                        placeholder='Y2'
                                        type="number"
                                        label={<Popup
                                            trigger={<Label>Y2</Label>}
                                            content='Bottom crop side'
                                            className='Popup'
                                            size='tiny'
                                        />}
                                        fluid
                                        value={this.state.y2 === 0 ? '' : this.state.y2} 
                                        onChange={(e) => this.setSingleState('y2', e.target.value)}
                                    />
                                </GridColumn>
                            </GridRow>
                            <GridRow>
                                <GridColumn width={8}>
                                    <Button 
                                        onClick={() => this.buildGIF()}
                                    >Build GIF</Button>
                                </GridColumn>
                                <GridColumn width={8}>
                                    <Button 
                                        disabled={this.state.gifLoading != 1}
                                        onClick={() => this.downloadGIF()}
                                    >Download GIF</Button>
                                </GridColumn>
                            </GridRow>
                        </Grid>
                        </GridColumn>
                    </GridRow>
                </Grid>
            </ModalContent>
            <ModalActions>
                <Button onClick={() => this.toggleModal(false)}>Close</Button>
            </ModalActions>
        </Modal>
        );
    }
}

export default ViewTimelapse