import React, { Component } from 'react';
import * as EVENTS from '../../const/events';
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';
import Timestamp from 'react-timestamp';
import {GFD, GlobalState, TUTORIAL_STATE} from '../../functions/GlobalState';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager';
import Hours from '../ui/Hours';
import Moment from 'react-moment';
import Message, { Label, Input, Item, Button, Popup, Icon, Grid, Segment, SegmentGroup, Divider } from 'semantic-ui-react';
import BuyPixelForm from '../forms/BuyPixelForm';
import SellPixelForm from '../forms/SellPixelForm';
import SetPixelColorForm from '../forms/SetPixelColorForm';
import TransferPropertyForm from '../forms/TransferPropertyForm';
import CancelSaleForm from '../forms/CancelSaleForm';
import MakePrivateForm from '../forms/MakePrivateForm';
import MakePublicForm from '../forms/MakePublicForm';
import PlaceBidForm from '../forms/PlaceBidForm';
import MessageModal from './MessageModal';
import Info from './Info';
import ErrorBox from '../ErrorBox';

const NOBODY = '0x0000000000000000000000000000000000000000';

class PixelDescriptionBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tokenEarnedInterval: null,
            x: '', 
            y: '',
            ctx: null,
            dataCtx: null,
            owner: "",
            isForSale: false,
            ETHPrice: 0,
            PPCPrice: 0,
            lastUpdate: 0,
            reserved: 0,
            latestBid: 0,
            isInPrivate: false,
            maxEarnings: 0,
            earnings: 0,
            hoverText: '',
            link: '',
            PPCOwned: 0,
            tutorialState: 0,
            isOpen: {
                BUY: false,
                SELL: false,
                SET_IMAGE: false,
                SET_CANCEL: false,
                SET_PUBLIC: false,
                SET_PRIVATE: false,
                TRANSFER: false,
                PLACCE_BID: false,
            },
            showMessage: false,
            evH1: null, 
            evH2: null, 
            evH3: null,
        }
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
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

    componentDidMount() {
        console.info('mountie')
        let ctx = this.canvas.getContext('2d');
        ctx.scale(10, 10);
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        let dataCtx = this.dataCanvas.getContext('2d');
        dataCtx.imageSmoothingEnabled = false;
        dataCtx.webkitImageSmoothingEnabled = false;
        this.setState({
            ctx, 
            dataCtx,
        });

        GFD.listen('tutorialStateIndex', 'pixelBrowse', (newID) => {
            this.setState({tutorialState: TUTORIAL_STATE[Object.keys(TUTORIAL_STATE)[newID]]})
        });
        GFD.listen('noAccount', 'pixelBrowse', (noAccount) => {
            this.setState({noAccount});
        })

        GFD.listen('x', 'pixelBrowse', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'pixelBrowse', (y) => {
            if (!GFD.getData('noMetaMask'))
                this.loadProperty(GFD.getData('x') - 1, y - 1);
            this.setState({y});
        })

        this.setState({timerUpdater: setInterval(() => this.timerUpdate(), 1000)});

        ctr.listenForResults(LISTENERS.ServerDataManagerInit, 'PixelBox', (results) => {
            if (results.imageLoaded && GFD.getData('ServerDataManagerInit') == 1) {
                let data = SDM.getPropertyData(this.state.x - 1, this.state.y - 1);
                let ethp = data.ETHPrice;
                let ppcp = data.PPCPrice;
                let reserved = data.becomePublic;
                let lastUpdate = data.lastUpdate;
                let maxEarnings = Math.pow((reserved - lastUpdate) / 30, 2);
                this.setState({
                    owner: data.owner,
                    isForSale: ppcp != 0,
                    ETHPrice: ethp,
                    PPCPrice: ppcp,
                    lastUpdate,
                    isInPrivate: data.isInPrivate,
                    reserved,
                    latestBid: data.lastestBid,
                    maxEarnings,
                    earnings: Func.calculateEarnings(lastUpdate, maxEarnings),
                });
    
                this.timerUpdate(lastUpdate, reserved);
                
                let canvasData = SDM.getPropertyImage(this.state.x - 1, this.state.y - 1);
                
                this.setCanvas(canvasData);
    
                this.startTokenEarnedInterval();
            } else if (!GFD.getData('noMetaMask')) {
                ctr.stopListeningForResults(LISTENERS.ServerDataManagerInit, 'PixelBox');
            }
        });

        if (GFD.getData('noMetaMask')) {
            GFD.listen('noMetaMask', 'DescBox', this.setup);
            return;
        }
        this.setup(false);
    }

    setup(noMetaMask) {            
        if (noMetaMask)
            return;
        GFD.close('noMetaMask', 'DescBox');
        ctr.watchEventLogs(EVENTS.PropertyColorUpdate, {}, (evH1) => {
            this.setState({evH1});
            evH1.watch((error, log) => {
                let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                let xx = GFD.getData('x') - 1
                let yy = GFD.getData('y') - 1;
                if (id.x == xx && id.y == yy) {
                    let colors = Func.ContractDataToRGBAArray(log.args.colors);
                    this.loadProperty(id.x, id.y, colors);
                }
            });
        });

        ctr.watchEventLogs(EVENTS.PropertyBought, {}, (evH2) => {
            this.setState({evH2});
            evH2.watch((error, log) => {
                let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                let xx = GFD.getData('x') - 1
                let yy = GFD.getData('y') - 1;
                if (id.x == xx && id.y == yy)
                    this.loadProperty(xx, yy);
            });
        });

        ctr.watchEventLogs(EVENTS.PropertySetForSale, {}, (evH3) => {
            this.setState({evH3});
            evH3.watch((error, log) => {
                let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                let xx = GFD.getData('x') - 1
                let yy = GFD.getData('y') - 1;
                if (id.x == xx && id.y == yy)
                    this.loadProperty(xx, yy);
            });
        });
    };

    timerUpdate(lastUpdate = this.state.lastUpdate, reserved = this.state.reserved) {
        let lastUpdateFormatted = Func.TimeSince(lastUpdate * 1000) + " ago";
        let reservedFormatted = Func.TimeSince(reserved * 1000, true);
        this.setState({
            lastUpdateFormatted,
            reservedFormatted,
        })
    }

    componentWillUnmount() {
        GFD.closeAll('pixelBrowse');
        ctr.stopListeningForResults(LISTENERS.ServerDataManagerInit, 'PixelBox');
        this.stopTokenEarnedInterval();
        this.state.evH1.stopWatching();
        this.state.evH2.stopWatching();
        this.state.evH3.stopWatching();
        clearTimeout(this.state.timerUpdater);
    }

    setCanvas(rgbArr) {
        let ctxID = this.state.dataCtx.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        this.state.dataCtx.putImageData(ctxID, 0, 0);
        this.state.ctx.drawImage(this.dataCanvas, 0, 0);
    }

    loadProperty(x, y, canvasData = null) {
        if (x === '' || y === '')
            return;
        ctr.getPropertyData(x, y, (data) => {  
            let ethp = Func.BigNumberToNumber(data[1]);
            let ppcp = Func.BigNumberToNumber(data[2]);
            let reserved = Func.BigNumberToNumber(data[5]);
            let lastUpdate = Func.BigNumberToNumber(data[3]);
            let maxEarnings = Math.pow((reserved - lastUpdate) / 30, 2);
            this.setState({
                owner: data[0],
                isForSale: ppcp != 0,
                ETHPrice: ethp,
                PPCPrice: ppcp,
                lastUpdate,
                isInPrivate: data[4],
                reserved,
                latestBid: Func.BigNumberToNumber(data[6]),
                maxEarnings,
                earnings: Func.calculateEarnings(lastUpdate, maxEarnings),
            });
            ctr.getHoverText(data[0], (data) => {
                if (data != null && data.length > 0)
                    this.setState({hoverText: data});
            });
            ctr.getLink(data[0], (data) => {
                if (data != null && data.length > 0)
                    this.setState({link: data});
            });
            ctr.getBalance((balance) => {
                this.setState({PPCOwned: balance});
            });
            this.timerUpdate(lastUpdate, reserved);
        });
        if (canvasData === null) {
            ctr.getPropertyColors(x, y, (x, y, canvasData) => {
                this.setCanvas(canvasData);
            });
        } else {
            this.setCanvas(canvasData);
        }
        this.stopTokenEarnedInterval();
        this.startTokenEarnedInterval();
    }

    startTokenEarnedInterval() {
        this.setState({
            tokenEarnedInterval: setInterval(() => {
                let newEarned = Func.calculateEarnings(this.state.lastUpdate, this.state.maxEarnings);
                if (this.state.earnings != newEarned)
                    this.setState({earnings: newEarned});
            }, 1000)
        })
    }

    stopTokenEarnedInterval() {
        clearInterval(this.state.tokenEarnedInterval);
    }

    placeBid() {
        ctr.getBalance((balance) => {
            if (balance < 1) {
                this.setState({showMessage: true});
                return;
            }
            this.toggleAction('PLACE_BID');
        });
    }

    getPriceFormat() {
        if (this.state.ETHPrice == 0 && this.state.PPCPrice == 0) 
            return "Not for sale"
        let s = this.state.ETHPrice == 0 ? '' : this.state.ETHPrice + ' ETH';
        s += this.state.ETHPrice != 0 && this.state.PPCPrice != 0 ? ' - ' : '';
        s += this.state.PPCPrice == 0 ? '' : this.state.PPCPrice + ' PXL';
        return s;
    }

    toggleAction(key) {
        if (this.state.tutorialState.index == 3 && key === 'SET_IMAGE') {
            GFD.setData('tutorialStateIndex', 1);
            return;
        }
        let opens = this.state.isOpen;
        opens[key] = !opens[key];
        this.setState({opens});
    }

    getActionsList() {
        let actions = [];
        if (!this.state.isInPrivate || this.state.tutorialState.index == 3) {
            actions.push(
                <Button fluid onClick={() => this.toggleAction('SET_IMAGE')}>Update Image</Button>
            );
        }
        // actions.push(new Action("Place Offer", null));
        if (this.state.isForSale && this.state.owner != ctr.account)
            actions.push(
                <Button fluid onClick={(this.state.tutorialState.index == 3 ? () => {} : () => this.toggleAction('BUY'))}>Buy</Button>
            );
        if (!this.state.isForSale && this.state.owner == ctr.account)
            actions.push(
                <Button fluid onClick={() => this.toggleAction('SELL')}>Sell</Button>
            );
        if (this.state.isForSale && this.state.owner == ctr.account)
            actions.push(
                <Button fluid onClick={() => this.toggleAction('CANCEL_SALE')}>Delist</Button>
            );
        if (this.state.owner == ctr.account) {
            if (this.state.isInPrivate) { //for this switch, we need to check to make sure we are the setter
                actions.push(
                    <Button fluid onClick={() => this.toggleAction('SET_PUBLIC')}>Set Public</Button>
                );
            } else {
                actions.push(
                    <Button fluid onClick={() => this.toggleAction('SET_PRIVATE')}>Set Private</Button>
                );
            }
            // actions.push(
            //     <Button fluid onClick={() => this.toggleAction('TRANSFER')}>Transfer</Button>
            // );
        }
        //blank one in case odd elements
        if (actions.length % 2 == 1) {
            actions.push(null);
        }
        let packed = [];
        for (let i = 0; i < actions.length; i += 2) {
            packed.push({a1: actions[i], a2: actions[i + 1]});
        }
        return packed;
    }

    visitLink() {
        let win = window.open(this.state.link, '_blank');
        win.focus();
    }

    getCurrentPayout() {
        if (this.state.isInPrivate) {
            return "N/A";
        } else if (this.state.lastUpdate == 0) {
            return "None";
        } else {
            return (this.state.earnings + '/' + this.state.maxEarnings) + " PXL";
        }
    }

    render() {
        return (
            <div className='pixelDescriptionBox'>
                <div className='colorPreview'>
                    <Item className='colorPreivewCanvasContainer'>
                        <canvas id='colorPreviewCanvas' width={100} height={100} ref={(canvas) => { this.canvas = canvas; }} ></canvas>
                    </Item>
                    <canvas className='hidden' width={10} height={10} ref={(dataCanvas) => { this.dataCanvas = dataCanvas; }} ></canvas>
                </div>
                <Divider/>
                <div className='twoColumn w50 left'>
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
                </div>
                <div className='twoColumn w50 right'>
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
                </div>
                {this.state.owner != '' ? 
                    <div>
                        <Divider/>
                        <Input
                            placeholder="Address"
                            fluid disabled
                            className='oneColumn'
                            value={(this.state.owner === ctr.account ? "You" : (this.state.owner === NOBODY ? "Unowned" : this.state.owner))} 
                            label={<Popup
                                trigger={<Label><Icon className='uniform' name='user'/></Label>}
                                content='Owner Address'
                                className='Popup'
                                size='tiny'
                            />}
                        />
                        <Input 
                            fluid disabled
                            labelPosition='right' 
                            type={this.state.latestBid == 0 ? "text" : "number"}
                            placeholder={"Enter PXL"}
                            className='oneColumn bidInput'
                            value={this.state.latestBid == 0 ? "None" : this.state.latestBid}
                            onChange={(e) => this.setState({latestBid: e.target.value})}
                        >
                            <Popup
                                trigger={<Label><Icon name='legal'/></Label>}
                                content='Lastest Bid'
                                className='Popup'
                                size='tiny'
                            />
                            <input className='bid'/>
                            <Label as='a'
                                className='bidButton'
                                onClick={() => this.placeBid()} 
                            >Bid</Label>
                        </Input>
                        <MessageModal 
                            title='Not Enough PXL!'
                            description='You must have at least 1 PXL to place a bid.'
                            isOpen={this.state.showMessage} 
                            onClose={() => {this.setState({showMessage: false})}}
                        />
                        <Input
                            label={<Popup
                                trigger={<Label><Icon className='uniform' name='dollar'/></Label>}
                                content='Price'
                                className='Popup'
                                size='tiny'
                            />} 
                            disabled
                            className='oneColumn'
                            value={this.getPriceFormat()} 
                        />
                        <Input
                            fluid disabled
                            label={<Popup
                                trigger={<Label><Icon className='uniform' name='time'/></Label>}
                                content='Last Update'
                                className='Popup'
                                size='tiny'
                            />}
                            className='oneColumn'
                            value={this.state.lastUpdate == 0 ? 'Never' : this.state.lastUpdateFormatted}
                        />
                        <Input
                            fluid disabled
                            label={<Popup
                                trigger={<Label><Icon className='uniform' name='money'/></Label>}
                                content='Current/Maximum Payout'
                                className='Popup'
                                size='tiny'
                            />}
                            className='oneColumn'
                            value={this.getCurrentPayout()}
                        />
                        <Input
                            label="Reserved"
                            fluid disabled
                            className='oneColumn'
                            label={<Popup
                                trigger={<Label><Icon className='uniform' name='ban'/></Label>}
                                content='Is Reserved'
                                className='Popup'
                                size='tiny'
                            />}
                            value={this.state.reserved == 0 || this.state.reserved * 1000 <= new Date().getTime() ? 'No'  : this.state.reservedFormatted}
                        />
                        <Input
                            label="Private"
                            fluid disabled
                            className='oneColumn'
                            label={<Popup
                                trigger={<Label><Icon className='uniform' name='hide'/></Label>}
                                content='Is Private'
                                className='Popup'
                                size='tiny'
                            />}
                            value={this.state.isInPrivate ? 'Yes' : 'No'}
                        />
                        <Input
                            label={<Popup
                                trigger={<Label><Icon className='uniform' name='comment'/></Label>}
                                content='Comment'
                                className='Popup'
                                size='tiny'
                            />}
                            fluid disabled
                            className='oneColumn'
                            value={this.state.hoverText != '' ? this.state.hoverText : "None Set"}
                        />
                        <Input
                            className='oneColumn combined'
                            fluid disabled
                            action={(this.state.link != '' ? 
                                <Popup
                                    trigger={<Button onClick={() => this.visitLink()}><Icon className='uniform' name='linkify'/>Visit</Button>}
                                    content='Link'
                                    className='Popup'
                                    size='tiny'
                                /> : null
                            )}
                            label={(this.state.link == '' ? 
                                <Popup
                                    trigger={<Label><Icon className='uniform' name='linkify'/></Label>}
                                    content='Link'
                                    className='Popup'
                                    size='tiny'
                                /> : null
                            )}
                            actionPosition='left'
                            value={this.state.link != '' ? this.state.link : "None Set"}
                        />
                    </div>
                : (!this.state.noAccount && <Info messages='Click a Property on the canvas or enter the coordinates above to see more about a property.'/>)}
                {this.state.x != '' && this.state.y != '' && !this.state.noAccount && 
                    <div className={(this.state.tutorialState.index == 3 ? TUTORIAL_STATE.getClassName(this.state.tutorialState.index, 3) + ' actions' : '')}>
                        <Divider/>
                        <Grid columns='two' divided>
                            {this.getActionsList().map((action, i) => (
                                <Grid.Row key={i}>
                                    <Grid.Column>
                                        {action.a1}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {action.a2}
                                    </Grid.Column>
                                </Grid.Row>
                            ))}
                        </Grid>
                    </div>
                } 
                {this.state.noAccount && 
                <div>
                    <Divider/>
                    <ErrorBox/>
                </div>}
            
                <BuyPixelForm tutorialState={this.state.tutorialState} isOpen={this.state.isOpen.BUY} close={this.toggleAction.bind(this)}/>
                <SellPixelForm isOpen={this.state.isOpen.SELL} close={this.toggleAction.bind(this)}/>
                <SetPixelColorForm tutorialState={this.state.tutorialState} isOpen={this.state.isOpen.SET_IMAGE} close={this.toggleAction.bind(this)}/>
                <CancelSaleForm isOpen={this.state.isOpen.CANCEL_SALE} close={this.toggleAction.bind(this)}/>
                <MakePublicForm isOpen={this.state.isOpen.SET_PUBLIC} close={this.toggleAction.bind(this)}/>
                <MakePrivateForm isOpen={this.state.isOpen.SET_PRIVATE} close={this.toggleAction.bind(this)}/>
                {/*<TransferPropertyForm isOpen={this.state.isOpen.TRANSFER} close={this.toggleAction.bind(this)}/>*/}
                <PlaceBidForm isOpen={this.state.isOpen.PLACE_BID} close={this.toggleAction.bind(this)}/>
            </div>
        );
    }
}

/*
Addd actions to the grid
*/

export default PixelDescriptionBox
