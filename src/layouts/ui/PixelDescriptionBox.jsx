import React, { Component } from 'react';
import {Contract, ctr, EVENTS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';
import Timestamp from 'react-timestamp';
import {GFD, GlobalState} from '../../functions/GlobalState';
import Hours from '../ui/Hours';
import Moment from 'react-moment';

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

    loadProperty(x, y, data = null) {
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
        });
        if (data === null) {
            ctr.getPropertyColors(x, y, (x, y, data) => {
                this.setCanvas(data);
            });
        } else {
            this.setCanvas(data);
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

    render() {
        return (
            <div>
                <div className='colorPreview'>
                    <canvas id='colorPreviewCanvas' width={100} height={100} ref={(canvas) => { this.canvas = canvas; }} ></canvas>
                    <canvas className='hidden' width={10} height={10} ref={(dataCanvas) => { this.dataCanvas = dataCanvas; }} ></canvas>
                </div>
                <table cellSpacing={0} cellPadding={0} className='data'>
                    <tbody>
                        <tr>
                            <th>X</th>
                            <td><input 
                                    type='number' 
                                    placeholder='1-100'
                                    value={this.state.x} 
                                    onChange={(e) => this.setX(e.target.value)}
                                ></input></td>
                        </tr>
                        <tr>
                            <th>Y</th>
                            <td><input 
                                    type='number' 
                                    placeholder='1-100'
                                    value={this.state.y} 
                                    onChange={(e) => this.setY(e.target.value)}
                                ></input></td>
                        </tr>
                        <tr>
                            <th>Owner</th>
                            <td>{this.state.owner}</td>
                        </tr>
                        <tr>
                            <th>For Sale</th>
                            <td>{this.state.isForSale ? 'Yes' : 'No'}</td>
                        </tr>
                        {this.state.isForSale ? (
                            <tr>
                                <th>Price</th>
                                <td>
                                    {this.state.ETHPrice == 0 ? '' : this.state.ETHPrice + ' ETH'}
                                    {this.state.ETHPrice != 0 && this.state.PPCPrice != 0 ? ' - ' : ''}
                                    {this.state.PPCPrice == 0 ? '' : this.state.PPCPrice + ' PPC'}
                                </td>
                            </tr>
                        ) : null}
                        <tr>
                            <th>Latest Bid</th>
                            <td>{this.state.latestBid == 0 ? "None" : this.state.latestBid}</td>
                        </tr>
                        <tr colSpan={2}>
                            <td>
                                <input 
                                    type='button' 
                                    onClick={() => this.placeBid()} 
                                    value='Place Bid (reword)'
                                ></input>
                            </td>
                        </tr>
                        <tr>
                            <th>Last Color Change</th>
                            <td>{this.state.lastUpdate == 0 ? 'Never' : <Timestamp time={this.state.lastUpdate} precision={2} autoUpdate/>}</td>
                        </tr>
                        <tr>
                            <th>Current Payout</th>
                            <td>
                                {this.state.lastUpdate == 0 ? "None" :
                                    <div>
                                        {this.state.earnings}
                                        /
                                        {this.state.maxEarnings}
                                    </div>
                                }
                            </td>
                        </tr>
                        <tr>
                            <th>Reserved</th>
                            <td>{this.state.reserved == 0 || this.state.reserved * 1000 <= new Date().getTime() ? 
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
                            }</td>
                        </tr>
                        <tr>
                            <th>Is Private</th>
                            <td>{this.state.isInPrivate ? 'Yes' : 'No'}</td>
                        </tr>
                        {this.state.hoverText != '' ? 
                            <tr>
                                <th>Comment</th>
                                <td>{this.state.hoverText}</td>
                            </tr>
                        : null}
                        {this.state.link != '' ? 
                            <tr>
                                <th>Link</th>
                                <td><a target="_blank" href={this.state.link}>{this.state.link}</a></td>
                            </tr>
                        : null}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default PixelDescriptionBox