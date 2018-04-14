import React, { Component } from 'react'
import Canvas from './Canvas.jsx'
import * as EVENTS from '../../const/events';
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import ErrorBox from '../ErrorBox';
import ZoomCanvas from './ZoomCanvas';
import Axios from '../../network/Axios.jsx';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import HoverLabel from './HoverLabel';
import {GFD, GlobalState, TUTORIAL_STATE} from '../../functions/GlobalState';
import * as Strings from '../../const/strings';
import * as Assets from '../../const/assets';
import ClickLoader from '../ui/ClickLoader';
import PixelDescriptionBox from '../ui/PixelDescriptionBox';
import PropertyChangeLogYou from '../logs/PropertyChangeLogYou';
import PropertyChangeLog from '../logs/PropertyChangeLog';
import PropertySalesLogYou from '../logs/PropertySalesLogYou';
import PropertySalesLog from '../logs/PropertySalesLog';
import PropertySalesLogTopPXL from '../logs/PropertySalesLogTopPXL';
import PropertySalesLogTopETH from '../logs/PropertySalesLogTopETH';
import Info from '../ui/Info';
import { Segment, SegmentGroup, Button, Divider, Label, 
    LabelDetail, Input, Icon, Item, ItemContent, ItemImage, 
    ItemGroup, Tab, Header, Grid, Sidebar, MenuItem, TabPane, Menu, Checkbox, Popup, Modal, ModalContent, ModalHeader} from 'semantic-ui-react';
import SetHoverText from '../forms/SetHoverText';
import SetLink from '../forms/SetLink';
import PropertiesOwned from '../ui/PropertiesOwned';
import PropertiesForSale from '../ui/PropertiesForSale';
import PropertyChangeLogTop from '../logs/PropertyChangeLogTop';
import Tutorial from '../Tutorial';
import WelcomeSidebar from '../ui/WelcomeSidebar';
import {FB, FireBase} from '../../const/firebase';

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
            askForTutorial: false,
            tutorialState: TUTORIAL_STATE.NONE,

            tab1Loading: false,
            tab2Loading: false,
        }
    }

    componentDidMount() {
        GFD.listen('tutorialStateIndex', 'CanvasPage', (newID) => {
            this.setState({tutorialState: TUTORIAL_STATE[Object.keys(TUTORIAL_STATE)[newID]]})
        });

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
            FB.signIn();
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
        GFD.closeAll('CanvasPage');
        ctr.stopListeningForEvent(EVENTS.AccountChange, 'CanvasPagePPCListener');
    }

    visitPortfolio() {
        this.portfolioLink.click();
    }

    changeMode(newMode = !this.state.advancedMode) {
        if (newMode)
            ctr.getAccounts();
        GFD.setData('advancedMode', newMode);
        this.setState({advancedMode: newMode, askForTutorial: false})
    }

    toggleForSaleProperties(e, data) {
        this.setState({showPopertiesForSale: data.checked});
        ctr.sendResults(LISTENERS.ShowForSale, {show: data.checked});
    }

    startTutorial() {
        GFD.setData('tutorialStateIndex', 1);
        this.changeMode(true);
    }

    showAskForTutorial() {
        if (this.state.advancedMode || localStorage.getItem('hasViewedTutorial')) {
            this.changeMode();
            return;
        }
        localStorage.setItem('hasViewedTutorial', true);
        this.setState({askForTutorial: true});
    }

    render() {
        let browsePanes = [
            { 
                menuItem: 'Owned', 
                render: () => <TabPane 
                    as='div'
                    className='topPane' 
                    loading={this.state.tab1Loading}
                    ><PropertiesOwned 
                        isLoading={(r) => this.setState({tab1Loading: r})}
                /></TabPane> 
            },
            { 
                menuItem: 'For Sale', 
                render: () => <TabPane 
                as='div'
                    className='topPane' 
                    loading={this.state.tab2Loading}
                    ><PropertiesForSale 
                        isLoading={(r) => this.setState({tab2Loading: r})}
                /></TabPane> 
            }];

        let payoutPanes = [
            { menuItem: 'Top 10', render: () => <TabPane className='middlePane' attached={false}><PropertyChangeLogTop/></TabPane> },
            { menuItem: 'Recent', render: () => <TabPane className='middlePane' attached={false}><PropertyChangeLog/></TabPane> },
            { menuItem: 'You', render: () => <TabPane className='middlePane' attached={false}><PropertyChangeLogYou/></TabPane> }
        ];

        let tradePanes = [
            { menuItem: 'Top 10 PXL', render: () => <TabPane className='bottomPane' attached={false}><PropertySalesLogTopPXL/></TabPane> },
            { menuItem: 'Top 10 ETH', render: () => <TabPane className='bottomPane' attached={false}><PropertySalesLogTopETH/></TabPane> },
            { menuItem: 'Recent', render: () => <TabPane className='bottomPane' attached={false}><PropertySalesLog/></TabPane> },
            { menuItem: 'You', render: () => <TabPane className='bottomPane' attached={false}><PropertySalesLogYou/></TabPane> }
        ];

        let modeButton = 
            <Button 
                size={this.state.advancedMode ? 'medium' : 'large'} 
                className='modeButton' 
                primary={!this.state.advancedMode} 
                onClick={() => {this.showAskForTutorial()}} 
                fluid
            >
                {this.state.advancedMode ? 'Viewing Mode' : 'Get Started'}
            </Button>

        return (
            <div>
                <SegmentGroup horizontal className='mainSegmentGroup'> 
                    <Segment className='left'>
                                <div id='logo' className='logo'>
                                    <img src={Assets.LOGO}/>
                                </div>
                                <Divider/>
                                <ZoomCanvas/>
                                <Divider/>
                                {this.state.advancedMode &&
                                    <div>
                                        <ItemGroup>
                                            <Item className='pixelsOwnedItem'>
                                                <ItemImage size='mini' src={this.state.loadingPPC ? Assets.LOADING : Assets.TOKEN}  />
                                                <ItemContent verticalAlign='middle'>{this.state.PPCOwned} </ItemContent>
                                            </Item>
                                        </ItemGroup>
                                        <Divider/>
                                    </div>
                                }
                                <Button onClick={() => this.visitPortfolio()} fluid>Visit PixelProperty.io</Button>
                                <a 
                                    href='https://pixelproperty.io/' 
                                    target='_blank' 
                                    className='hideElement' 
                                    ref={(portfolioLink) => { this.portfolioLink = portfolioLink; }} 
                                />
                                <Divider/>
                                {this.state.advancedMode ? 
                                    <div>
                                        {modeButton}
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
                                :
                                    <Modal size='mini' 
                                        open={this.state.askForTutorial}
                                        trigger={modeButton}
                                        closeOnEscape={false}
                                        closeOnRootNodeClick={false}
                                    >
                                        <ModalHeader>Getting Started</ModalHeader>
                                        <ModalContent>
                                        <Info messages={Strings.TUTORIAL_START_DIALOG} size='small'/>
                                            <Button primary fluid onClick={() => {this.startTutorial()}}>Start the Tutorial</Button>
                                            <Divider/>
                                            <Button secondary fluid onClick={() => {this.changeMode()}}>I'm a Returning User</Button>
                                        </ModalContent>
                                    </Modal>
                                }
                    </Segment>
                    <Segment id='step1' className={'center' + TUTORIAL_STATE.getClassName(this.state.tutorialState.index, 1)}>
                        <HoverLabel showPrices={this.state.showPopertiesForSale}/>
                        {this.state.tutorialState.index == 0 && <ClickLoader/>}
                        <Canvas/>
                    </Segment>
                    <Segment id={(this.state.tutorialState.index == 3 ? 'hiddenForward' : '')} className={'right' + TUTORIAL_STATE.getClassName(this.state.tutorialState.index, 2) + (this.state.tutorialState.index == 3 ? ' hiddenForward' : '')}>
                            {this.state.advancedMode ? 
                                <PixelDescriptionBox/>
                            : 
                                <WelcomeSidebar/>
                            }
                    </Segment>
                </SegmentGroup>
                <Segment className={(this.state.advancedMode ? 'lowerSegment one' : 'lowerSegment one hideElement')}>
                    <div>
                        <Header>Property Browse</Header>
                        <Tab menu={{ secondary: true, pointing: true }} panes={browsePanes} />
                    </div>
                </Segment>
                <Segment className={(this.state.advancedMode ? 'lowerSegment two' : 'lowerSegment two hideElement')}>
                    <div>
                        <Header>Payout History</Header>
                        <Tab menu={{ secondary: true, pointing: true }} panes={payoutPanes} />
                    </div>
                </Segment>
                <Segment className={(this.state.advancedMode ? 'lowerSegment three' : 'lowerSegment three hideElement')}>
                    <div>
                        <Header>Trade History</Header>
                        <Tab menu={{ secondary: true, pointing: true }} panes={tradePanes} />
                    </div>
                </Segment>
                <Sidebar id='footer' className='footer' as={Menu} animation='push' direction='bottom' visible inverted>
                    <MenuItem name='file text outline'>
                    <Icon name='file text outline' />
                    Privacy Policy
                    </MenuItem>
                    <MenuItem name='file text outline'>
                    <Icon name='file text outline' />
                    TOS
                    </MenuItem>
                    <MenuItem name='file text outline' onClick={() => {
                        this.startTutorial();
                    }}>
                    <Icon name='help circle' />
                    Tutorial
                    </MenuItem>
                    <MenuItem position='right' name='settings' onClick={() => {ctr.setupContracts()}}>
                    <Icon name='settings'></Icon>
                    </MenuItem>
                </Sidebar>
                <Tutorial/>
            </div>
        );
    }
}

export default CanvasPage