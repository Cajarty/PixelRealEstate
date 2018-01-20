import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../contract/contract.jsx';

class Alerts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alerts: {},
        };
        this.receiveMessage = this.receiveMessage.bind(this);
    }

    componentDidMount() {
        ctr.listenForResults(LISTENERS.Alert, this.receiveMessage);
    }

    componentWillUnmount() {
        ctr.stopListeningForResults(LISTENERS.Alert);
    }

    receiveMessage(data) {
        let now = new Date().getTime();
        let update = this.state.alerts;
        update[now] = {className: 'alert', message: data.message};
        setTimeout(() => {
            setTimeout(() => {
                let update = this.state.alerts;
                delete update[now];
                this.setState({alerts: update});
            }, 985);
            let update = this.state.alerts;
            update[now] = {className: 'alert fadeOut', message: data.message};
            this.setState({alerts: update});
        }, 4000);
        this.setState({alerts: update});
    }

    render() {
        return (
            <div className='alertContainer'>
               {Object.keys(this.state.alerts).map((i) => 
                   <div key={i} className={this.state.alerts[i].className}>{this.state.alerts[i].message}</div>
               )}
            </div>
        );
    }
}

export default Alerts