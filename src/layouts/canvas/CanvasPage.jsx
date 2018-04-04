import React, { Component } from 'react'
import Canvas from './Canvas.jsx'
import * as EVENTS from '../../const/events';
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import ErrorBox from '../ErrorBox';
import ZoomCanvas from './ZoomCanvas';
import Axios from '../../network/Axios.jsx';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import HoverLabel from './HoverLabel';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as Strings from '../../const/strings';
import HoverBox from './HoverBox';
import * as Assets from '../../const/assets';
import ClickLoader from '../ui/ClickLoader';
import PixelDescriptionBox from '../ui/PixelDescriptionBox';
import PropertyChangeLogYou from '../logs/PropertyChangeLogYou';
import PropertyChangeLog from '../logs/PropertyChangeLog';
import PropertySalesLog from '../logs/PropertySalesLog';
import { Segment, SegmentGroup, Button, Divider, Label, 
    LabelDetail, Input, Icon, Item, ItemContent, ItemImage, 
    ItemGroup, Tab, Header, Grid, Sidebar, MenuItem, TabPane, Menu, Checkbox, Popup} from 'semantic-ui-react';
import SetHoverText from '../forms/SetHoverText';
import SetLink from '../forms/SetLink';
import PropertiesOwned from '../ui/PropertiesOwned';
import PropertiesForSale from '../ui/PropertiesForSale';
import PropertyChangeLogTop from '../logs/PropertyChangeLogTop';

class CanvasPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pixelDataUpdateVersion: 0,
            pixelData: null,
            loadingPPC: true,
            PPCOwned: 0,
            advancedMode: false,
            showPopertiesForSale: false,

            tab1Loading: false,
            tab2Loading: false,
        }
    }

    componentDidMount() {
        ctr.getBalance((balance) => {
            GFD.setData('balance', balance);
            this.setState({PPCOwned: balance, loadingPPC: false});
        });

        ctr.watchEventLogs(EVENTS.Transfer, {}, (handle) => {
            let eventHandleTransfer = handle;
            this.setState({eventHandleTransfer});
            eventHandleTransfer.watch((error, log) => {
                if (log.args._from === ctr.account || log.args._to === ctr.account) {
                    this.setState({loadingPPC: true});
                    ctr.getBalance((balance) => {
                        this.setState({PPCOwned: balance, loadingPPC: false});
                    });
                }
            });
        });

        ctr.listenForEvent(EVENTS.AccountChange, 'CanvasPagePPCListener', (data) => {
            this.setState({loadingPPC: true});
            ctr.getBalance((balance) => {
                this.setState({PPCOwned: balance, loadingPPC: false});
            });
        });

        ctr.watchEventLogs(EVENTS.PropertyBought, {newOwner: ctr.account}, (handle) => {
            let eventHandleBought = handle;
            this.setState({eventHandleBought});
            eventHandleBought.watch((error, log) => {
                this.setState({loadingPPC: true});
                ctr.getBalance((balance) => {
                    this.setState({PPCOwned: balance, loadingPPC: false});
                });
            });
        });

        ctr.watchEventLogs(EVENTS.PropertyColorUpdate, {lastUpdaterPayee: ctr.account}, (handle) => {
            let eventHandleUpdate = handle;
            this.setState({eventHandleUpdate});
            eventHandleUpdate.watch((error, log) => {
                this.setState({loadingPPC: true});
                ctr.getBalance((balance) => {
                    this.setState({PPCOwned: balance, loadingPPC: false});
                });
            });
        });
        GFD.listen('advancedMode', 'CanvasPage', (advancedMode) => {
            this.setState({advancedMode})
        });
        this.updateScreen();
        window.onresize = (ev) => this.updateScreen;
    }

    updateScreen() {
        let width = document.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        GFD.setData('screenWidth', width);
        GFD.setData('screenHeight', document.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
    }

    componentWillUnmount() {
        this.state.eventHandleTransfer.stopWatching();
        this.state.eventHandleBought.stopWatching();
        this.state.eventHandleUpdate.stopWatching();
        ctr.stopListeningForEvent(EVENTS.AccountChange, 'CanvasPagePPCListener');
    }

    visitPortfolio() {
        this.portfolioLink.click();
    }

    changeMode() {
        let newMode = !this.state.advancedMode;
        GFD.setData('advancedMode', newMode);
        this.setState({advancedMode: newMode})
    }

    toggleForSaleProperties(e, data) {
        this.setState({showPopertiesForSale: data.checked});
        ctr.sendResults(LISTENERS.ShowForSale, {show: data.checked});
    }

    render() {
        let browsePanes = [
            { 
                menuItem: 'Owned', 
                render: () => <TabPane 
                    className='topPane' 
                    attached={false}
                    loading={this.state.tab1Loading}
                    ><PropertiesOwned 
                        isLoading={(r) => this.setState({tab1Loading: r})}
                /></TabPane> 
            },
            { 
                menuItem: 'For Sale', 
                render: () => <TabPane 
                    className='topPane' 
                    attached={false}
                    loading={this.state.tab2Loading}
                    ><PropertiesForSale 
                        isLoading={(r) => this.setState({tab2Loading: r})}
                /></TabPane> 
            }];

        let payoutPanes = [{ menuItem: 'Top 10', render: () => <TabPane className='middlePane' attached={false}><PropertyChangeLogTop/></TabPane> },
        { menuItem: 'Recent', render: () => <TabPane className='middlePane' attached={false}><PropertyChangeLog/></TabPane> },
        { menuItem: 'You', render: () => <TabPane className='middlePane' attached={false}><PropertyChangeLogYou/></TabPane> }];

        let tradePanes = [{ menuItem: 'Top 10', render: () => <TabPane className='bottomPane' attached={false}>Tab 1 Content</TabPane> },
        { menuItem: 'Recent', render: () => <TabPane className='bottomPane' attached={false}>none yet</TabPane> },
        { menuItem: 'You', render: () => <TabPane className='bottomPane' attached={false}><PropertySalesLog/></TabPane> }];
        return (
            <div>
                <SegmentGroup horizontal className='mainSegmentGroup'> 
                    <Segment className='left'>
                        <SegmentGroup>
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
                            </Segment>
                            <Segment>
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
                                    <Divider/>
                                    <Checkbox 
                                        label={'Show Properties for sale'} 
                                        checked={this.state.showPopertiesForSale}
                                        onChange={(e, data) => {this.toggleForSaleProperties(e, data)}}
                                    />
                                </div>
                                }
                            </Segment>
                        </SegmentGroup>
                    </Segment>
                    <Segment className='center'>
                        <HoverLabel showPrices={this.state.showPopertiesForSale}/>
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
                <Segment className={(this.state.advancedMode ? 'lowerSegment' : 'lowerSegment hideElement')}>
                    <div>
                        <Header>Property Browse</Header>
                        <Tab menu={{ secondary: true, pointing: true }} panes={browsePanes} />
                    </div>
                </Segment>
                <Segment className={(this.state.advancedMode ? 'lowerSegment' : 'lowerSegment hideElement')}>
                    <div>
                        <Header>Payout History</Header>
                        <Tab menu={{ secondary: true, pointing: true }} panes={payoutPanes} />
                    </div>
                </Segment>
                <Segment className={(this.state.advancedMode ? 'lowerSegment' : 'lowerSegment hideElement')}>
                    <div>
                        <Header>Trade History</Header>
                        <Tab menu={{ secondary: true, pointing: true }} panes={tradePanes} />
                    </div>
                </Segment>
                <Sidebar id='footer' className='footer' as={Menu} animation='push' direction='bottom' visible inverted>
                    <MenuItem name='home'>
                    <Icon name='home' />
                    Home
                    </MenuItem>
                    <MenuItem name='gamepad'>
                    <Icon name='gamepad' />
                    Games
                    </MenuItem>
                    <MenuItem name='camera'>
                    <Icon name='camera' />
                    Channels
                    </MenuItem>
                </Sidebar>
            </div>
        );
    }
}

export default CanvasPage