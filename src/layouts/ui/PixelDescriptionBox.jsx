import React, { Component } from 'react';
import {Contract, ctr, EVENTS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';
import Timestamp from 'react-timestamp';
import {GFD, GlobalState} from '../../functions/GlobalState';
import Hours from '../ui/Hours';
import Moment from 'react-moment';
import {Label, Input, Item, Button, Popup, Icon, Grid, Segment, SegmentGroup} from 'semantic-ui-react';
import BuyPixelForm from '../forms/BuyPixelForm';
import SellPixelForm from '../forms/SellPixelForm';
import SetPixelColorForm from '../forms/SetPixelColorForm';

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
            isOpen: {
                BUY: false,
                SELL: false,
                SET_IMAGE: false,
            }
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

        GFD.listen('x', 'pixelBrowse', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'pixelBrowse', (y) => {
            this.loadProperty(GFD.getData('x') - 1, y - 1);
            this.setState({y});
        })

        ctr.listenForEvent(EVENTS.PropertyColorUpdate, 'PixelDescriptionBox', (data) => {
            let xy = {x: 0, y: 0, colors: []};
            if (data.args.x == null || data.args.y == null)
                xy = ctr.fromID(Func.BigNumberToNumber(data.args.property));
            else {
                xy.x = data.args.x;
                xy.y = data.args.y;
            }

            if (xy.x !== this.state.x - 1 || xy.y !== this.state.y - 1)
                return;

            if (data.args.colorsRGB == null)
                xy.colors = Func.ContractDataToRGBAArray(data.args.colors);
            else
                xy.colors = data.args.colorsRGB;

            this.loadProperty(xy.x, xy.y, xy.colors);
        });
    }

    calculateEarnings(last = this.state.lastUpdate, max = this.state.maxEarnings) {
        let now = new Date().getTime();
        let maxTime = (last + (max * 60)) * 1000;
        let current = Math.min(now, maxTime);
        return Math.floor((current - (last * 1000)) / 60000);
    }

    componentWillUnmount() {
        GFD.closeAll('pixelBrowse');
        this.stopTokenEarnedInterval();
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
                earnings: this.calculateEarnings(lastUpdate, maxEarnings),
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
        });
        if (canvasData === null) {
            ctr.getPropertyColors(x, y, (x, y, canvasData) => {
                this.setCanvas(canvasData);
            });
        } else {
            this.setCanvas(canvasData);
        }
        this.startTokenEarnedInterval();
    }

    startTokenEarnedInterval() {
        this.setState({
            tokenEarnedInterval: setInterval(() => {
                let newEarned = this.calculateEarnings(this.state.lastUpdate, this.state.maxEarnings);
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
                alert("You must have at least 1 PXL to place a bid.");
                return;
            }
            let bid = window.prompt("Please enter an amount of PXL from 1 to " + balance + ". Bids cost 1 PXL each.");
            ctr.makeBid(this.state.x - 1, this.state.y - 1, parseInt(bid));
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
        let opens = this.state.isOpen;
        opens[key] = !opens[key];
        this.setState({opens});
    }

    getActionsList() {
        let actions = [];
        if (this.state.isForSale)
            actions.push(<Button fluid onClick={() => this.toggleAction('BUY')}>Buy</Button>);
        if (!this.state.isForSale && this.state.owner == ctr.account)
             actions.push(<Button fluid onClick={() => this.toggleAction('SELL')}>Sell</Button>);
        // if (this.state.isForSale && this.state.owner == ctr.account)
        //     actions.push(new Action("Cancel Sale", null));
        actions.push(<Button fluid onClick={() => this.toggleAction('SET_IMAGE')}>Update Image</Button>);
        // actions.push(new Action("Place Offer", null));
        // if (this.state.owner == ctr.account) {
        //     if (this.state.isInPrivate) {
        //         actions.push(new Action("Make Public", null));
        //     } else {
        //         actions.push(new Action("Make Private", null));
        //     }
        //     actions.push(new Action("Transfer", null));
        // }
        //blank one, remember to disable it.
        if (actions.length % 2 == 1) {
            actions.push(null);
        }
        let packed = [];
        for (let i = 0; i < actions.length; i += 2) {
            packed.push({a1: actions[i], a2: actions[i + 1]});
        }
        return packed;
    }

    render() {
        return (
            <SegmentGroup className='pixelDescriptionBox'>
                <Segment className='colorPreview'>
                    <Item className='colorPreivewCanvasContainer'>
                        <canvas id='colorPreviewCanvas' width={100} height={100} ref={(canvas) => { this.canvas = canvas; }} ></canvas>
                    </Item>
                    <canvas className='hidden' width={10} height={10} ref={(dataCanvas) => { this.dataCanvas = dataCanvas; }} ></canvas>
                </Segment>
                <Segment>
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
                    <Input
                        placeholder="Address"
                        fluid
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
                        fluid
                        labelPosition='right' 
                        type={this.state.latestBid == 0 ? "text" : "number"}
                        placeholder={"Enter PXL"}
                        className='oneColumn'
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
                        <Label
                            onClick={() => this.placeBid()} 
                        >Bid</Label>
                    </Input>
                    <Input
                        label={<Popup
                            trigger={<Label><Icon className='uniform' name='dollar'/></Label>}
                            content='Price'
                            className='Popup'
                            size='tiny'
                        />}
                        className='oneColumn'
                        value={this.getPriceFormat()} 
                    />
                    <Input
                        fluid
                        label={<Popup
                            trigger={<Label><Icon className='uniform' name='time'/></Label>}
                            content='Last Update'
                            className='Popup'
                            size='tiny'
                        />}
                        className='oneColumn'
                        value={this.state.lastUpdate == 0 ? 'Never' : Func.TimeSince(Date.now() - new Date(Date.now() - (this.state.lastUpdate * 1000))) + " ago"}
                    />
                    <Input
                        fluid
                        label={<Popup
                            trigger={<Label><Icon className='uniform' name='money'/></Label>}
                            content='Current/Maximum Payout'
                            className='Popup'
                            size='tiny'
                        />}
                        className='oneColumn'
                        value={this.state.lastUpdate == 0 ? "None" : (this.state.earnings + '/' + this.state.maxEarnings) + " PXL"}
                    />
                    <Input
                        label="Reserved"
                        fluid
                        className='oneColumn'
                        label={<Popup
                            trigger={<Label><Icon className='uniform' name='ban'/></Label>}
                            content='Is Reserved'
                            className='Popup'
                            size='tiny'
                        />}
                        value={this.state.reserved == 0 || this.state.reserved * 1000 <= new Date().getTime() ? 
                            'No' 
                        : 
                            <Moment 
                                onChange={
                                    (val) => {
                                        if (this.state.reserved * 1000 <= new Date().getTime())
                                            this.forceUpdate();
                                    }
                                } 
                                interval={1000} 
                                fromNow 
                                ago>
                                {this.state.reserved * 1000}
                            </Moment>
                        }
                    />
                    <Input
                        label="Private"
                        fluid
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
                        fluid
                        className='oneColumn'
                        value={this.state.hoverText != '' ? this.state.hoverText : "None Set"}
                    />
                    <Input
                        label={<Popup
                            trigger={<Label><Icon className='uniform' name='linkify'/></Label>}
                            content='Link'
                            className='Popup'
                            size='tiny'
                        />}
                        fluid
                        className='oneColumn'
                        value={this.state.link != '' ? <a target="_blank" href={this.state.link}>{this.state.link}</a> : "None Set"}
                    />
                </Segment>
                <Segment>
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
                </Segment>
                {console.info(this.state.isOpen)}
                <BuyPixelForm isOpen={this.state.isOpen.BUY} close={this.toggleAction.bind(this)}/>
                <SellPixelForm isOpen={this.state.isOpen.SELL} close={this.toggleAction.bind(this)}/>
                <SetPixelColorForm isOpen={this.state.isOpen.SET_IMAGE} close={this.toggleAction.bind(this)}/>
            </SegmentGroup>
        );
    }
}

/*
Addd actions to the grid
*/

export default PixelDescriptionBox