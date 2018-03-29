import React, { Component } from 'react'
import Canvas from './Canvas.jsx'
import {Contract, ctr, LISTENERS, EVENTS} from '../../contract/contract.jsx';
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
import PropertyChangeLogYou from '../logs/PropertyChangeLogYou';
import PropertySalesLog from '../logs/PropertySalesLog';
import { Segment, SegmentGroup, Button, Divider, Label, LabelDetail, Input, Icon, Item, ItemContent, ItemImage, ItemGroup, Tab, Header, Grid, Sidebar, MenuItem, TabPane, Menu} from 'semantic-ui-react';
import SetHoverText from '../forms/SetHoverText';
import SetLink from '../forms/SetLink';
import PropertiesOwned from '../ui/PropertiesOwned';
import PropertiesForSale from '../ui/PropertiesForSale';

class CanvasPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pixelDataUpdateVersion: 0,
            pixelData: null,
            loadingPPC: true,
            PPCOwned: 0,
            advancedMode: false,

            tab2Loading: false,
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
        this.updateScreen();
        window.onresize = (ev) => this.updateScreen;
    }

    updateScreen() {
        let width = document.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        GFD.setData('screenWidth', width);
        GFD.setData('screenHeight', document.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
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
        let browsePanes = [{ menuItem: 'Owned', render: () => <TabPane attached={false}><PropertiesForSale isLoading={() => {}}/></TabPane> },
        { menuItem: 'For Sale', render: () => <TabPane attached={false} loading={this.state.tab2Loading}><PropertiesForSale isLoading={(r) => this.setState({tab2Loading: r})}/></TabPane> }];

        let payoutPanes = [{ menuItem: 'Top 10', render: () => <TabPane attached={false}>Tab 1 Content</TabPane> },
        { menuItem: 'Recent', render: () => <TabPane attached={false}>none yet</TabPane> },
        { menuItem: 'You', render: () => <TabPane attached={false}><PropertyChangeLogYou/></TabPane> }];

        let tradePanes = [{ menuItem: 'Top 10', render: () => <TabPane attached={false}>Tab 1 Content</TabPane> },
        { menuItem: 'Recent', render: () => <TabPane attached={false}>none yet</TabPane> },
        { menuItem: 'You', render: () => <TabPane attached={false}><PropertySalesLog/></TabPane> }];
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