import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import { Slider } from 'react-semantic-ui-range';
import {Divider, ModalDescription, Input, Popup, Label, Modal, ModalHeader, ModalContent, ModalActions, Button, FormInput, LabelDetail, Icon } from 'semantic-ui-react';

class BuyPixelForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
            ETHPrice: 0,
            PPCPrice: 0,
            PPCSelected: 0,
            ETHToPay: 0,
            PPCToPay: 0,
            isOpen: false,
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
        GFD.listen('x', 'buyPixel', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'buyPixel', (y) => {
            this.setState({y});
            ctr.getForSalePrices(GFD.getData('x') - 1, y - 1, (data) => {
                let eth = Func.BigNumberToNumber(data[0]);
                let ppc = Func.BigNumberToNumber(data[1]);
                this.setState({
                    ETHPrice: eth, 
                    PPCPrice: ppc,
                    PPCSelected: 0,
                    ETHToPay: (eth != 0 ? eth : 0),
                    PPCToPay: (eth == 0 ? ppc : 0),
                });
            });
        })
    }

    componentWillUnmount() {
        GFD.closeAll('buyPixel');
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
    }

    buyProperty() {
        if (this.state.x >= 1 && this.state.x <= 100 && this.state.y >= 1 && this.state.y <= 100) {
            ctr.buyProperty(this.state.x - 1, this.state.y - 1, this.state.ETHToPay, this.state.PPCToPay, (result) => {
                this.toggleModal(!result);
            });
        }
    }

    toggleModal(set = null) {
        let res = set != null ? set : !this.state.isOpen;
        this.setState({isOpen: res});
        this.props.close('BUY');
    }
    
    updatePriceSlider(value) {
        let totals = this.calculateTotal(value);

        this.setState({
            PPCSelected: value,
            ETHToPay: totals.ETH,
            PPCToPay: totals.PPC
        });
    }

    calculateTotal(ppcSelected) {
        let obj = {
            ETH: this.state.ETHPrice, 
            PPC: this.state.PPCPrice
        };
        if (this.state.ETHPrice == 0)
            return obj;
        obj.PPC = ppcSelected;
        obj.ETH = Math.ceil(((this.state.PPCPrice - ppcSelected) / this.state.PPCPrice) * this.state.ETHPrice);
        return obj;
    }

    render() {
        return (
            <Modal size='mini' 
                open={this.state.isOpen} 
                closeIcon 
                onClose={() => this.toggleModal(false)}
                >
                <ModalHeader>Buy Property</ModalHeader>
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
                        <Divider horizontal>Price</Divider>
                        {this.state.ETHPrice == 0 ?
                        <div style={{textAlign: 'center'}}>
                            <Label >PXL<LabelDetail>{this.state.PPCToPay}</LabelDetail></Label>
                        </div>
                        :
                        <div>
                            <Label>PXL<LabelDetail>{this.state.PPCToPay}</LabelDetail></Label>
                            <Label style={{float: 'right'}}>ETH<LabelDetail>{this.state.ETHToPay}</LabelDetail></Label>
                            <FormInput
                                className='buySlider'
                                min={0}
                                max={this.state.PPCPrice}
                                type='range'
                                step={1}
                                value={this.state.PPCSelected}
                                onChange={(e) => this.updatePriceSlider(e.target.value)}
                            />
                            {null && <Button icon labelPosition='right' size='mini'>
                                Pay Extra
                                <Popup
                                    trigger={<Icon name='question'/>}
                                    content='If the Ethereum network is busy, the new Property price may not update in time. Adding to the base price will help ensure having sufficient funds for the purchase.'
                                    className='Popup'
                                    size='tiny'
                                />
                            </Button>}
                        </div>}
                </ModalContent>
                <ModalActions>
                    <Button primary onClick={() => this.buyProperty()}>Buy Property</Button>
                </ModalActions>
            </Modal>
        );
    }
}

export default BuyPixelForm