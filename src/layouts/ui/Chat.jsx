import React, { Component } from 'react'
import { Message } from 'semantic-ui-react';

export default class Chat extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Message className='message' id='message'>
                Coming soon!
            </Message>
        );
    }
}




