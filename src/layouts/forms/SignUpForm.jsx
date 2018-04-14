import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import { Slider } from 'react-semantic-ui-range';
import * as Strings from '../../const/strings';
import Info from '../ui/Info';
import {TUTORIAL_STATE} from '../../functions/GlobalState';
import { Form, Button } from 'semantic-ui-react';
import {FB, FireBase} from '../../const/firebase';
import * as EVENTS from '../../const/events';
import * as Const from '../../const/const';

class SignUpForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            wallet: '',
            email: '',
            username: '',
        };
    }

    componentDidMount() {
        if (!GFD.getData('noAccount'))   
            this.setState({wallet: ctr.account});
        ctr.listenForEvent(EVENTS.AccountChange, 'SignUpForm', (data) => {
            this.setState({wallet: data});
        });
    }

    updateEmail(value) {
        this.setState({email: value});
    }

    updateUsername(value) {
        this.setState({username: value});
    }

    signUp() {
        FB.signUp(this.state.wallet, this.state.username, this.state.email, Const.TOS_VERSION);
    }

    render() {
        return (
            <Form>
                <Form.Field>
                    <label>Wallet Address</label>
                    <input disabled value={this.state.wallet} onChange={() => {}}/>
                </Form.Field>
                <Form.Field>
                    <label>Email Address</label>
                    <input 
                        placeholder='example@pixelproperty.io' 
                        value={this.state.email} 
                        onChange={(e) => this.updateEmail(e.target.value)}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Username</label>
                    <input 
                        placeholder='PixelProperty' 
                        value={this.state.username} 
                        onChange={(e) => this.updateUsername(e.target.value)}
                    />
                </Form.Field>
                <Button type='submit' onClick={() => this.signUp()} >Submit</Button>
            </Form>
        );
    }
}

export default SignUpForm