import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import ConfirmModal from '../ui/ConfirmModal';
import {Modal, ModalContent, Input, ModalHeader, Popup, Label, Divider, Icon, ModalActions} from 'semantic-ui-react';

class TransferPropertyForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
            valueNewOwner: '',
            isMetaMaskOpen: false,
        };
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
        GFD.listen('x', 'transferProperty', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'transferProperty', (y) => {
            this.setState({y});
        })
    }

    componentWillUnmount() {
        GFD.closeAll('transferProperty');
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
    }

    handleNewOwner(newOwner) {
        this.setState({valueNewOwner: newOwner});
    }

    toggleModal(set = null) {
        if (this.state.isMetaMaskOpen)
            return;
        let res = set != null ? set : !this.state.isOpen;
        this.setState({isOpen: res});
        if (!res)
            this.props.close("TRANSFER");
    }

    dialogResults(res) {
        if (res) {
            this.setState({isMetaMaskOpen: true})
            ctr.transferProperty(this.state.x - 1, this.state.y - 1, this.state.valueNewOwner, (res) => {
                this.setState({isOpen: !res, isMetaMaskOpen: false});
            })
        } else {
            this.setState({isOpen: false, isMetaMaskOpen: false});
            this.toggleModal(false);
        }
    }

    render() {
        return (
            <Modal size='mini' 
                open={this.state.isOpen} 
                closeIcon 
                onClose={() => this.toggleModal(false)}
                >
                <ModalHeader>Transfer Property</ModalHeader>
                <ModalContent>
                    <div className='twoColumn w50 left'>
                        <Input
                            placeholder="1 - 100"
                            type="number"
                            className='oneColumnFull'
                            fluid
                            label={<Popup
                                trigger={<Label className='uniform'>X</Label>}
                                content='X Position'
                                className='Popup'
                                size='tiny'
                            />}
                            value={this.state.x} 
                            onChange={(e) => this.setX(e.target.value)}
                        />
                        </div>
                        <div className='twoColumn w50 right'>
                        <Input
                            placeholder="1 - 100"
                            type="number"
                            label={<Popup
                                trigger={<Label className='uniform'>Y</Label>}
                                content='Y Position'
                                className='Popup'
                                size='tiny'
                            />}
                            className='oneColumnFull'
                            fluid
                            value={this.state.y} 
                            onChange={(e) => this.setY(e.target.value)}
                        />
                    </div>
                <Divider horizontal>New Owner</Divider>
                <Input
                    placeholder="Address"
                    fluid
                    className='oneColumn'
                    value={this.state.owner}
                    onChange={(e) => this.handleNewOwner(e.target.value)}
                    label={<Popup
                        trigger={<Label><Icon className='uniform' name='user'/></Label>}
                        content='New Owner Address'
                        className='Popup'
                        size='tiny'
                    />}
                />
                </ModalContent>
                <ModalActions>
                    <ConfirmModal 
                        title='Confirm Property Transfer'
                        description={'Are you sure you would like to give this property to ' + this.state.valueNewOwner + '?'}
                        activateName='Transfer Property' 
                        result={(result) => this.dialogResults(result)}
                    />
                </ModalActions>
            </Modal>
        );
    }
}

export default TransferPropertyForm