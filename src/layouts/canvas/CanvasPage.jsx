import React, { Component } from 'react'
import Canvas from './Canvas.jsx'
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
import { Segment, SegmentGroup, Button, Divider, Label, LabelDetail, Input, Icon, Item, ItemContent, ItemImage, ItemGroup} from 'semantic-ui-react';
import SetHoverText from '../forms/SetHoverText';
import SetLink from '../forms/SetLink';

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
            <div>
                <SegmentGroup horizontal className='mainSegmentGroup'> 
                    <Segment className='left'>
                        <SegmentGroup className='pixelDescriptionBox'>
                            <Segment>
                                <ZoomCanvas/>
                            </Segment>
                            <Segment>
                                <ItemGroup>
                                    <Item>
                                        <ItemImage size='mini' src={this.state.loadingPPC ? Assets.LOADING : Assets.TOKEN}  />
                                        <ItemContent verticalAlign='middle'>{this.state.PPCOwned} </ItemContent>
                                    </Item>
                                </ItemGroup>
                                <Divider/>
                                <Button onClick={() => this.visitPortfolio()} fluid>Visit PixelProperty.io</Button>
                                <a 
                                    href='https://pixelproperty.io/' 
                                    target='_blank' 
                                    className='hideElement' 
                                    ref={(portfolioLink) => { this.portfolioLink = portfolioLink; }} 
                                />
                                <Divider/>
                                <Button onClick={() => this.changeMode()} fluid>{this.state.advancedMode ? 'See Less...' : 'See More...'}</Button>
                                {this.state.advancedMode &&
                                <div>
                                    <Divider/>
                                    <SetHoverText/>
                                    <SetLink/>
                                </div>
                                }
                            </Segment>
                            <Segment>

                            </Segment>
                        </SegmentGroup>
                    </Segment>
                    <Segment className='center'>
                        <HoverLabel/>
                        <HoverBox/>
                        <Canvas/>
                    </Segment>
                    <Segment className='right'>
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
                    </Segment>
                </SegmentGroup>
                <div className='middle-top'>
                </div>
                <div className={'middle' + (this.state.advancedMode ? '' : ' hideElement')}>
                    <PropertySalesLog/>
                </div>
                <div className='bottom'>
                </div>
            </div>
        );
    }
}

export default CanvasPage


{/* <div className='banner'>
<a 
    href='https://pixelproperty.io/' 
    target='_blank' 
    className='hideElement' 
    ref={(portfolioLink) => { this.portfolioLink = portfolioLink; }} 
/>
<div className='headerButtons'>
    <input 
        type='button' 
        className='headerButton left' 
        value='Homepage' 
        onClick={() => this.visitPortfolio()}
    ></input>
    {this.state.advancedMode ? 
        <div className='ppcLabel'>
            <img className='token icon' src={Assets.TOKEN} draggable={false}></img>
            <div className='text'>
                {this.state.PPCOwned}
                {this.state.loadingPPC ? <img className='loading icon' src={Assets.LOADING} draggable={false}></img> : ''}
            </div>
        </div>
    : null}
    <input 
        type='button' 
        className='headerButton right' 
        value={this.state.advancedMode ? 'Viewing Mode' : 'Interactive Mode'}
        onClick={() => this.changeMode()}
    ></input>
</div>
</div> */}