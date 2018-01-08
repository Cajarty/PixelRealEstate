import React, { Component } from 'react'
import {Contract, ctr} from '../contract/contract.jsx';

import './alerts.scss'

class Alerts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alerts: {},
        };
        this.receiveMessage = this.receiveMessage.bind(this);
    }

    componentDidMount() {
        ctr.listenForResults('alert', this.receiveMessage);
    }

    componentWillUnmount() {
        ctr.stopListeningForResults('alert');
    }

    receiveMessage(data, message) {
        let now = new Date().getTime();
        let update = this.state.alerts;
        update[now] = message;
        setTimeout(() => {
            let update = this.state.alerts;
            delete update[now];
            this.setState({alerts: update});
        }, 5000);
        this.setState({alerts: update});
    }

    render() {
        return (
            <div className='alertContainer'>
               {Object.keys(this.state.alerts).map((i) => 
                   <div className='alert' key={i}>{this.state.alerts[i]}</div>
               )}
            </div>
        );
    }
}

export default Alerts