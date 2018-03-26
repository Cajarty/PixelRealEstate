import React, { Component } from 'react'
import Canvas from './Canvas.jsx'
import ManagePanel from './ManagePanel.jsx'
import ActionPanel from './ActionPanel.jsx'
import {Contract, ctr, LISTENERS, EVENTS} from '../../contract/contract.jsx';
import PropertySalesLog from '../ui/PropertySalesLog';
import ErrorBox from '../ErrorBox';
import ZoomCanvas from './ZoomCanvas';
import Axios from '../../network/Axios.jsx';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import TimeAgo from 'react-timeago';
import HoverLabel from './HoverLabel';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as Strings from '../../const/strings';
import HoverBox from './HoverBox';
import * as Assets from '../../const/assets';
import ClickLoader from '../ui/ClickLoader';
import PixelDescriptionBox from '../ui/PixelDescriptionBox';
import {Segment, SegmentGroup} from 'semantic-ui-react';

class CanvasPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pixelDataUpdateVersion: 0,
            pixelData: null,
            loadingPPC: true,
            PPCOwned: 0,
            advancedMode: false
        }
    }

    componentDidMount() {
        ctr.getBalance((balance) => {
            this.setState({PPCOwned: balance, loadingPPC: false});
        });
        ctr.listenForEvent(EVENTS.Transfer, 'CanvasPagePPCListener', (data) => {
            if (data.args._from === ctr.account || data.args._to === ctr.account) {
                this.setState({loadingPPC: true});
                ctr.getBalance((balance) => {
                    this.setState({PPCOwned: balance, loadingPPC: false});
                });
            }
        });
        ctr.listenForEvent(EVENTS.AccountChange, 'CanvasPagePPCListener', (data) => {
            this.setState({loadingPPC: true});
            ctr.getBalance((balance) => {
                this.setState({PPCOwned: balance, loadingPPC: false});
            });
        });
        ctr.listenForEvent(EVENTS.PropertyBought, 'CanvasPagePPCListener', (data) => {
            if (data.args.newOwner === ctr.account) {
                this.setState({loadingPPC: true});
                ctr.getBalance((balance) => {
                    this.setState({PPCOwned: balance, loadingPPC: false});
                });
            }
        });
        ctr.listenForEvent(EVENTS.PropertyColorUpdate, 'CanvasPagePPCListener', (data) => {
            if (data.args.lastUpdaterPayee != null && data.args.lastUpdaterPayee === ctr.account) {
                this.setState({loadingPPC: true});
                ctr.getBalance((balance) => {
                    this.setState({PPCOwned: balance, loadingPPC: false});
                });
            }
        });
        GFD.listen('advancedMode', 'CanvasPage', (advancedMode) => {
            this.setState({advancedMode})
        });
    }

    componentWillUnmount() {
        ctr.stopListeningForEvent(EVENTS.Transfer, 'CanvasPagePPCListener');
        ctr.stopListeningForEvent(EVENTS.PropertyColorUpdate, 'CanvasPagePPCListener');
        ctr.stopListeningForEvent(EVENTS.PropertyBought, 'CanvasPagePPCListener');
    }

    visitPortfolio() {
        this.portfolioLink.click();
    }

    changeMode() {
        let newMode = !this.state.advancedMode;
        GFD.setData('advancedMode', newMode);
        this.setState({advancedMode: newMode})
    }

    render() {
        return (
            <SegmentGroup>
               
                <div className='top'>
                    <div className='leftMain full'>
                        <ZoomCanvas/>
                        <div className='infoBox'>
                        </div>
                    </div>
                    <div className='centerMain'>
                        <HoverLabel/>
                        <HoverBox/>
                        <Canvas/>
                    </div>
                    <div className='rightMain full'>
                        <ErrorBox/>
                        <div className='infoBox'>
                            {this.state.advancedMode ? 
                                <div>
                                    <PixelDescriptionBox/>
                                </div> 
                            : 
                                <div>
                                    {Strings.SIMPLE_MODE_INTRO_RIGHT}
                                    <br/>
                                    {Strings.ADDRESSES[Math.floor(Math.random() * Strings.ADDRESSES.length)]}
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className='middle-top'>
                </div>
                <div className={'middle' + (this.state.advancedMode ? '' : ' hideElement')}>
                    <PropertySalesLog/>
                </div>
                <div className='bottom'>
                </div>
            </SegmentGroup>
        );
    }
}

export default CanvasPage