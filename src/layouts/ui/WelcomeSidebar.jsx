import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as Strings from '../../const/strings';
import { Segment, Header, Image , Button, Message, Form, List, Divider} from 'semantic-ui-react';
import * as Assets from '../../const/assets';

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
                            <List.Item as='li' value='*'>{log.title + ' - ' + log.date.toDateString()}
                                <List.Item as='ol'>
                                {log.messages.map((msg, ii) => {
                                    return (<List.Item as='li' value='-'>{msg}</List.Item>);
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

/*
<Message className='message' id='message'>
                    <Message.Header>
                        Play Now!
                    </Message.Header>
                    <Message.Content>
                    <p>
                        To start, all you need is the MetaMask browser extension:
                    </p>
                    <Image 
                        rounded fluid bordered
                        className='downloadImage'
                        src={Assets.METAMASK_DOWNLOAD}
                        href='https://metamask.io' 
                        as='a'
                        target='_blank'
                    />
                    <Form>
                        <Form.Field>
                            <label>Wallet Address</label>
                            <input placeholder='First Name' />
                        </Form.Field>
                        <Form.Field>
                            <label>Email Address</label>
                            <input placeholder='example@pixelproperty.io' />
                        </Form.Field>
                        <Button type='submit'>Submit</Button>
                    </Form>
                </Message.Content>
                </Message>
*/