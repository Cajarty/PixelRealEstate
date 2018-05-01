import React, { Component } from 'react'
import {GFD, GlobalState } from '../../functions/GlobalState';
import * as Func from '../../functions/functions.jsx';
import {Contract, ctr } from '../../contract/contract.jsx';
import {GridColumn, Grid, GridRow, Label, LabelDetail, Loader} from 'semantic-ui-react';
import * as EVENTS from '../../const/events';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager';
import * as Struct from '../../const/structs';


class PropertySalesLogYou extends Component {
    constructor(props) {
        super(props);
        this.state = {
            changeLog: [],
            eventHandle1: null,
            eventHandle2: null,
            isLoading: true,
            loadTimeout: null,
        }
    }

    componentDidMount() {
        GFD.listen('userExists', 'Log-PSLY', (loggedIn) => {
            if (!loggedIn)
                return;
            if (SDM.eventData.yourTrades.length > 0) {
                this.setState({changeLog: SDM.eventData.yourTrades, isLoading: false});
            }
            ctr.watchEventLogs(EVENTS.PropertyBought, {newOwner: ctr.account}, (handle) => {
                let eventHandle1 = handle;
                this.setState({eventHandle1});
                handle.watch((error, log) => {
                    let old = this.state.changeLog;
                    let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                    let PXLPrice = Func.BigNumberToNumber(log.args.PXLAmount);
                    let ETHPrice = Func.BigNumberToNumber(log.args.ethAmount);
                    let timeSold = Func.BigNumberToNumber(log.args.timestamp);
                    let newData = {
                        x: id.x,
                        y: id.y,
                        PXLPrice,
                        ETHPrice,
                        oldOwner: log.args.oldOwner == ctr.account ? "You" : (log.args.oldOwner === Struct.NOBODY ? 'PixelProperty' : log.args.oldOwner),
                        newOwner: log.args.newOwner == ctr.account ? "You" : log.args.newOwner,
                        timeSold: timeSold * 1000,
                        transaction: log.transactionHash,
                    };
                    old.unshift(newData);
                    if (old.length > 20)
                        old.pop();
                    this.setState({ changeLog: old, isLoading: false });
                });
            }, 10000);

            ctr.watchEventLogs(EVENTS.PropertyBought, {oldOwner: ctr.account}, (handle) => {
                let eventHandle2 = handle;
                this.setState({
                    eventHandle2,
                    loadTimeout: setTimeout(() => {this.setState({isLoading: false})}, 15000),
                });
                handle.watch((error, log) => {
                    let old = this.state.changeLog;
                    let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                    let PXLPrice = Func.BigNumberToNumber(log.args.PXLAmount);
                    let ETHPrice = Func.BigNumberToNumber(log.args.ethAmount);
                    let timeSold = Func.BigNumberToNumber(log.args.timestamp);
                    let newData = {
                        x: id.x,
                        y: id.y,
                        PXLPrice,
                        ETHPrice,
                        oldOwner: log.args.oldOwner == ctr.account ? "You" : (log.args.oldOwner === Struct.NOBODY ? 'PixelProperty' : log.args.oldOwner),
                        newOwner: log.args.newOwner == ctr.account ? "You" : log.args.newOwner,
                        timeSold: timeSold * 1000,
                        transaction: log.transactionHash,
                    };
                    old.unshift(newData);
                    if (old.length > 20)
                        old.pop();
                    this.setState({ changeLog: old, isLoading: false });
                });
            }, 10000);
        });
    }

    setLocation(x, y) {
        GFD.setData('x', x);
        GFD.setData('y', y);
        Func.ScrollTo(Func.PAGES.TOP);
    }

    componentWillUnmount() {
        this.state.eventHandle1.stopWatching();
        this.state.eventHandle2.stopWatching();
        this.state.loadTimeout != null && clearTimeout(this.state.loadTimeout);
        GFD.closeAll('Log-PSLY');
    }

    render() {
        if (this.state.changeLog.length == 0 && !this.state.isLoading)
            return (<h3 className='noContent'>No recent trades</h3>);
        if (this.state.isLoading)
            return(<Loader size='small' active/>);
        return (
            <Grid className='detailTable'>
                <GridRow columns={5} textAlign='center'>
                    <GridColumn width={1}>
                        X
                    </GridColumn>
                    <GridColumn width={1}>
                        Y
                    </GridColumn>
                    <GridColumn width={3}>
                        Price
                    </GridColumn>
                    <GridColumn width={4}>
                        Seller
                    </GridColumn>
                    <GridColumn width={4}>
                        Buyer
                    </GridColumn>
                    <GridColumn width={2}>
                        Time Traded
                    </GridColumn>
                    <GridColumn width={1}>
                        Tx
                    </GridColumn>
                </GridRow>
                {this.state.changeLog.map((log) => (
                    <GridRow className='gridItem' onClick={() => this.setLocation(log.x + 1, log.y + 1) }  key={log.transaction} columns={5} textAlign='center'> 
                        <GridColumn verticalAlign='middle' width={1}>{log.x + 1}</GridColumn>
                        <GridColumn verticalAlign='middle' width={1}>{log.y + 1}</GridColumn>
                        <GridColumn verticalAlign='middle' width={3}>{
                            <div>
                                {log.PXLPrice > 0 && <Label>PXL<LabelDetail>{Func.NumberWithCommas(log.PXLPrice)}</LabelDetail></Label>}
                                {log.ETHPrice > 0 && <Label>ETH<LabelDetail>{Func.WeiToEth(log.ETHPrice)}</LabelDetail></Label>}
                            </div>
                        }</GridColumn>
                        <GridColumn verticalAlign='middle' width={4}>{log.oldOwner}</GridColumn>
                        <GridColumn verticalAlign='middle' width={4}>{log.newOwner}</GridColumn>
                        <GridColumn verticalAlign='middle' width={2}>{Func.TimeSince(log.timeSold) + ' ago'}</GridColumn>
                        <GridColumn verticalAlign='middle' width={1}><a target='_blank' href={'https://etherscan.io/tx/' + log.transaction} >details</a></GridColumn>
                    </GridRow>
                ))}
            </Grid>
        );
    }
}

export default PropertySalesLogYou