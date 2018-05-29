import React, { Component } from 'react'
import { Message, List, Icon, Divider, Input } from 'semantic-ui-react';
import {FB, FireBase} from '../../const/firebase';
import {ctr, contract, LISTENERS} from '../../contract/contract';

export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
        };
        this.handleMessageInput = this.handleMessageInput.bind(this);
    }

    componentDidMount() {
        FB.watchChat((newMessage) => {
            console.info(newMessage)
        });
    }

    componentWillUnmount() {
        FB.stopWatchingChat();
    }

    handleMessageInput(ev, data) {
        this.setState({message: ev.target.value});
    }

    sendMessage() {
        FB.sendChatMessage(this.state.message, (result) => {
            if (result) {
                this.setState({message: ''});
            } else {
                ctr.sendResults(LISTENERS.Alert, {result: false, message: "Unable to send chat message at this time."});
            }
        })
    }

    render() {
        return (
            <div>
            <List divided verticalAlign='middle' className='chatMessages'>
                <ChatMessage 
                    isMe={false}
                    username='johnny boy'
                    message='Message me something neat'
                />
                <ChatMessage 
                    isMe={true}
                    username='johnny boy'
                    message='ok johhnynn boyj'
                />
            </List>
            <Divider/>
            <Input 
                focus
                className='sendMessageInput'
                action='Send' 
                onChange={this.handleMessageInput}
                onKeyPress={(ev) => {if (ev.key === 'Enter') this.sendMessage()}}
                placeholder='Send' 
                maxLength={100}
                value={this.state.message}
            />
            </div>
        );
    }
}

class ChatMessage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
        <List.Item className='chatMessage'>
            <List.Content floated={this.props.isMe ? 'right' : 'left'}>
                <List.Header 
                    style={{textAlign: (this.props.isMe ? 'right' : 'left')}}
                >{this.props.username}</List.Header>
                <List.Description>{this.props.message}</List.Description>
            </List.Content>
        </List.Item>
        );
    }
}



