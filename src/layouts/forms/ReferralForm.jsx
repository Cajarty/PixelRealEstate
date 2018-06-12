import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import { Slider } from 'react-semantic-ui-range';
import * as Strings from '../../const/strings';
import * as Assets from '../../const/assets';
import Info from '../ui/Info';
import {TUTORIAL_STATE} from '../../functions/GlobalState';
import { Form, Button, Message, ModalActions, Modal, Grid, Image, ModalContent, ModalHeader, Checkbox, Label, Input, FormInput, GridRow, GridColumn } from 'semantic-ui-react';
import {FB, FireBase} from '../../const/firebase';
import * as EVENTS from '../../const/events';
import * as Const from '../../const/const';
import ErrorBox from '../ErrorBox';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager';

const REFERRAL_BASE_URL = 'https://canvas.pixelproperty.io/referral=';

class ReferralForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            referralLink: '',
            wallet: '',
            earnedPXL: 0,
            exampleReferrees: 100,
            exampleTotalPXLEarned: 0,
            examplePXLEarnedEach: 0,
        };
    }

    componentWillReceiveProps(newProps) {
        this.setState({referralAddress: newProps.referralAddress});
    }

    componentDidMount() {
        if (!GFD.getData('noAccount') && ctr.account != null)   
            this.setState({
                wallet: ctr.account,
                referralLink: REFERRAL_BASE_URL + ctr.account,
            });
        ctr.listenForEvent(EVENTS.AccountChange, 'SignUpForm', (data) => {
            this.setState({
                wallet: data,
                referralLink: REFERRAL_BASE_URL + data,
            });
        });
        this.updateExampleSlider(this.state.exampleReferrees);
    }

    updateExampleSlider(exampleReferrees) {
        let exampleTotalPXLEarned = 0;
        for (let i = 0; i < exampleReferrees; i++) {
            exampleTotalPXLEarned += Math.ceil(10 + (i / 25));
        }
        let examplePXLEarnedEach = exampleTotalPXLEarned / exampleReferrees;
        this.setState({
            exampleReferrees,
            exampleTotalPXLEarned,
            examplePXLEarnedEach: (isNaN(examplePXLEarnedEach) ? 0 : examplePXLEarnedEach),
        });
    }

    render() {
        return ( 
            <Modal size='tiny' 
                closeIcon 
                trigger={<Button fluid>Referral Rewards</Button>}
            >
                <ModalContent>  
                    <Grid>
                        <GridRow width={16}>
                            <GridColumn width={3}>
                                <Image src={Assets.TOKEN}/>
                            </GridColumn>
                            <GridColumn width={13}>
                            Referral Rewards
                            </GridColumn>
                        </GridRow>
                    </Grid>
                    <Message>
                        The PixelProperty Referral system rewards you for inviting new users to the canvas.  Referring users increases your rewards multiplier.  Users must register in order for a referral to be valid.
                        <br/>
                        <br/>
                        Referral rewards after {Func.NumberWithCommas(this.state.exampleReferrees)} users referred: {Func.NumberWithCommas(this.state.exampleTotalPXLEarned)} PXL.
                        <br/>
                        ({Func.NumberWithCommas(this.state.examplePXLEarnedEach.toFixed(2))} PXL per referred user)
                    </Message>
                    <FormInput
                        fluid
                        min={1}
                        max={10000}
                        type='range'
                        step={10}
                        value={this.state.exampleReferrees}
                        onChange={(e) => this.updateExampleSlider(e.target.value)}
                    />
                    <Form>
                        <Form.Field>
                            <Label pointing='below'>Your referral link</Label>
                            <Input 
                                disabled
                                fluid
                                value={this.state.referralLink}
                                action={'copy'}
                            />
                        </Form.Field>
                    </Form>
                </ModalContent>
            </Modal>
        );
    }
}

export default ReferralForm