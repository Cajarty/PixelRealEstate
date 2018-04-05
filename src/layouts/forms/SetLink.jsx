import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';
import * as Strings from '../../const/strings';
import {Modal, ModalActions, ModalHeader, ModalContent, Input, Button, Divider, Message} from 'semantic-ui-react';

class SetHoverText extends Component {
    constructor(props) {
        super(props);
        this.state = {
            linkText: '',
        };
    }

    componentDidMount() {
        ctr.getLink(ctr.account, (data) => {
            this.setState({linkText: data});
        });
    }

    handleInput(key, value) {
        let obj = {};
        obj[key] = value;
        this.setState(obj);
    }

    render() {
        return (
            <Modal
                closeIcon
                size='tiny'
                trigger={<Button style={{marginTop: '16px'}} fluid>Set Link</Button>}
            >
                <ModalHeader>Set Property Links</ModalHeader>
                <ModalContent>
                <Message size='mini' floating fluid>
                    {Strings.FORM_SET_LINK.map((str, i) => (
                        <p key={i}>{str}</p>
                    ))}
                </Message>
                <Divider/>
                    <Input 
                        fluid
                        label='http://' 
                        placeholder='website.com'
                        maxLength={64} 
                        onChange={(e) => this.handleInput('linkText', e.target.value)} 
                        value={this.state.linkText}
                    />
                </ModalContent>
                <ModalActions>
                    <Button primary onClick={() => ctr.setLink('http://' + this.state.linkText)}>Set Link</Button>
                </ModalActions>
            </Modal>
        );
    }
}

export default SetHoverText