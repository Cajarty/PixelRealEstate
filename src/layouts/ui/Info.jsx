import React, { Component } from 'react'
import { Message } from 'semantic-ui-react';

export default class Info extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (Array.isArray(this.props.messages))
            return (
                <Message size='tiny' floating>
                    {this.props.messages.map((str, i) => (
                        <p key={i}>{str}</p>
                    ))}
                </Message>
            );
        else
            return (
                <Message size='tiny' floating>
                    {this.props.messages}
                </Message>
            );
    }
}

