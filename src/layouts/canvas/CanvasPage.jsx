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
    }

    componentWillUnmount() {
        ctr.stopListeningForEvent(EVENTS.Transfer, 'CanvasPagePPCListener');
        ctr.stopListeningForEvent(EVENTS.PropertyColorUpdate, 'CanvasPagePPCListener');
        ctr.stopListeningForEvent(EVENTS.PropertyBought, 'CanvasPagePPCListener');
    }

    visitPortfolio() {
        this.portfolioLink.click();
    }

    render() {
        return (
            <div>
                <a 
                    href='http://pixelproperty.io/' 
                    target='_blank' 
                    className='hideElement' 
                    ref={(portfolioLink) => { this.portfolioLink = portfolioLink; }} 
                />
                <div className='banner'>

                    <div className='headerButtons'>
                        <input 
                            type='button' 
                            className='headerButton left' 
                            value='More info...' 
                            onClick={() => this.visitPortfolio()}
                        ></input>
                        {this.state.showAdvanced ? 
                            <div className='ppcLabel'>PPC Owned: {this.state.PPCOwned}{this.state.loadingPPC ? ' LOADING' : ''}</div>
                        : null}
                        <input 
                            type='button' 
                            className='headerButton right' 
                            value={this.state.showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                            onClick={() => this.setState({showAdvanced: !this.state.showAdvanced})
                        }></input>
                    </div>
                </div>
                <div className='top'>
                    <div className={this.state.showAdvanced ? '' : ' hideElement'}>
                        <ManagePanel />
                    </div>
                    <div className={this.state.showAdvanced ? 'leftMain' : 'leftMain full'}>
                        <div>
                            <ZoomCanvas/>
                            <div className='infoBox'>
                                Some nice info
                            </div>
                        </div>
                    </div>
                    <div className='centerMain'>
                        <Canvas/>
                    </div>
                    <div className={this.state.showAdvanced ? 'rightMain' : 'rightMain full'}>
                            <div className='infoBox'>
                                Some more nice info
                            </div>
                    </div>
                    <div className={this.state.showAdvanced ? '' : ' hideElement'}>
                        <ActionPanel/>
                    </div>
                </div>
                <div className='middle-top'>
                    <ErrorBox/>
                </div>
                <div className={'middle' + (this.state.showAdvanced ? '' : ' hideElement')}>
                    <PropertySalesLog/>
                </div>
                <div className='bottom'>
                </div>
            </div>
        );
    }
}

export default CanvasPage