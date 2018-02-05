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

class CanvasPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pixelDataUpdateVersion: 0,
            pixelData: null,
            loadingPPC: true,
            PPCOwned: 0,
            showAdvanced: false,
        }
    }

    componentDidMount() {
        SDM.init();
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
        ctr.listenForEvent(EVENTS.PropertyColorUpdate, 'CanvasPagePPCListener', (data) => {
            if (data.args.lastUpdaterPayee != null && data.args.lastUpdaterPayee === ctr.account) {
                this.setState({loadingPPC: true});
                ctr.getBalance((balance) => {
                    this.setState({PPCOwned: balance, loadingPPC: false});
                });
            }
        });
    }

    componentWillUnmount() {
        ctr.stopListeningForEvent(EVENTS.Transfer, 'CanvasPagePPCListener');
        ctr.stopListeningForEvent(EVENTS.PropertyColorUpdate, 'CanvasPagePPCListener');
    }

    render() {
        return (
            <div>
                <div className={'banner' + (this.state.showAdvanced ? '' : ' hideElement')}>
                    PPC Owned: {this.state.PPCOwned}{this.state.loadingPPC ? ' LOADING' : ''}
                </div>
                <div className='top'>
                    <div className='leftMain'>
                        <ManagePanel/>
                        <div>
                            <ZoomCanvas/>
                        </div>
                    </div>
                    <div className='centerMain'>
                        <Canvas/>
                    </div>
                    <div className='rightMain'>
                        <ActionPanel/>
                    </div>
                </div>
                <div className='middle-top'>
                    <ErrorBox/>
                </div>
                <div className='middle'>
                    <PropertySalesLog/>
                </div>
                <div className='bottom'>
                </div>
            </div>
        );
    }
}

export default CanvasPage