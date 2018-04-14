import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as Strings from '../../const/strings';
import { Segment, Header, Image , Button, Message, Form, List, Divider} from 'semantic-ui-react';
import * as Assets from '../../const/assets';
import SignUpForm from '../forms/SignUpForm';

class WelcomeSidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <Segment className='WelcomeSidebar' compact >
                <Header size='large'>
                    Welcome to PixelProperty
                </Header>
                <Message className='message' id='message'>
                    <Message.Header size='large'>
                        Change Log
                    </Message.Header>
                    <Divider/>
                    <Message.Content>
                    <List divided relaxed>
                    {Strings.CHANGELOG.map((log, i) => {
                        return (
                            <List.Item key={i} as='li' value='*'>{log.title + ' - ' + log.date.toDateString()}
                                <List.Item as='ol'>
                                {log.messages.map((msg, ii) => {
                                    return (<List.Item key={ii} as='li' value='-'>{msg}</List.Item>);
                                })}
                                </List.Item>
                            </List.Item>
                        );
                    })}
                    </List>
                </Message.Content>
                </Message>
            </Segment>
        );
    }
}

export default WelcomeSidebar