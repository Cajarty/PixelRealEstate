import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../contract/contract.jsx';
import {Modal, Button, ModalHeader, ModalContent, ModalActions, Icon, Divider, Image, Message} from 'semantic-ui-react';
import * as Strings from '../const/strings';
import * as Const from '../const/const';
import * as Func from '../functions/functions';
import {FB, FireBase} from '../const/firebase';
import {GFD, GlobalState, TUTORIAL_STATE} from '../functions/GlobalState';
import Info from './ui/Info';
import * as Assets from '../const/assets';
import SignUpForm from './forms/SignUpForm';

class GetStarted extends Component {
    constructor(props) {
        super(props);
        this.state = {
            noMetaMask: true, //metamask is installed
            network: Const.NETWORK_DEV, //network.
            userExists: false, //the user exists.
        };
    }

    reloadForMetaMask() {
        localStorage.setItem('startInAdvancedMode', true);
        location.reload();
    }

    componentDidMount() {
        GFD.listen('noMetaMask', 'getStarted', (noMetaMask) => {
            this.setState({noMetaMask});
        });

        GFD.listen('network', 'getStarted', (network) => {
            this.setState({network});
        });

        GFD.listen('userExists', 'getStarted', (userExists) => {
            this.setState({userExists});
        });
    }

    render() {
        if (!this.props.advancedMode)
            return null;
        return(
            <div>
                <Modal
                    size='small'
                    open={this.state.noMetaMask}
                    closeOnEscape={false}
                    closeOnRootNodeClick={false}
                >
                    <ModalHeader>Get MetaMask</ModalHeader>
                    <ModalContent>  
                        <Message>
                            Looks like you're missing MetaMask! You'll need MetaMask to use the canvas.
                            Click below to install the browser extension.
                        </Message>
                        <Image 
                            rounded bordered
                            size='large'
                            className='downloadImage'
                            src={Assets.METAMASK_DOWNLOAD}
                            href='https://metamask.io' 
                            as='a'
                            target='_blank'
                        />
                    </ModalContent>
                    <ModalActions>
                        <Button secondary onClick={() => this.props.changeMode()}>Cancel</Button>
                        <Button primary onClick={() => this.reloadForMetaMask()}>I Installed MetaMask</Button>
                    </ModalActions>
                </Modal>
                <Modal
                    size='small'
                    open={!this.state.noMetaMask && this.state.network != Const.NETWORK_RINKEBY}
                    closeOnEscape={false}
                    closeOnRootNodeClick={false}
                >
                    <ModalHeader>Switch Networks</ModalHeader>
                    <ModalContent>  
                        <Message>
                            We currently use the Rinkeby network to test Pixel Property. Open MetaMask
                            and change the network. MetaMask is at the top right of your browser.
                        </Message>
                        <Image 
                            rounded bordered
                            size='large'
                            className='downloadImage'
                            src={Assets.RINKEBY_NETWORK}
                            target='_blank'
                        />
                    </ModalContent>
                    <ModalActions>
                        <Button secondary onClick={() => this.props.changeMode()}>Cancel</Button>
                    </ModalActions>
                </Modal>
                <Modal
                    open={!this.state.noMetaMask && this.state.network === Const.NETWORK_RINKEBY && !this.state.userExists && 4== 3}
                    closeOnEscape={false}
                    closeOnRootNodeClick={false}
                >
                    <ModalHeader>Sign Up</ModalHeader>
                    <ModalContent>  
                        <SignUpForm/>
                    </ModalContent>
                </Modal>
            </div>
        );
    }
}

export default GetStarted


/*
     <Modal size='mini' 
                open={this.props.open}
                trigger={this.props.trigger}
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
*/