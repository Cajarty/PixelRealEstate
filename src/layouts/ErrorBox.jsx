import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../contract/contract.jsx';

class ErrorBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            hideErrors: {},
        };
        this.receiveMessage = this.receiveMessage.bind(this);
        this.removeHideError = this.removeHideError.bind(this);
    }

    componentDidMount() {
        ctr.listenForResults(LISTENERS.Error,  'error', this.receiveMessage);
    }

    componentWillUnmount() {
        ctr.stopListeningForResults(LISTENERS.Error);
    }

    removeHideError(errorId) {
        delete this.state.hideErrors[errorId];
    }

    hideError(errorId) {
        let hideErrors = this.state.hideErrors;
        let errors = this.state.errors;
        delete errors[errorId];
        hideErrors[errorId] = setTimeout(() => this.removeHideError(errorId), 3000);
        this.setState({hideErrors, errors});
    }

    receiveMessage(data) {
        let update = this.state.errors;
        if (data.errorId != null && this.state.hideErrors[data.errorId] == null)
            update[data.errorId] = {errorType: data.errorType, message: data.message};
        if (data.removeErrors != null)
            for(let i = 0; i < data.removeErrors.length; i++)
                delete update[i];
        this.setState({errors: update});
    }

    render() {
        return (
            <div className='errorBox'>
               {Object.keys(this.state.errors).map((i) => 
                    <div key={i} className={'error ' + (this.state.errors[i].errorType)}>
                        <div className='message'>{this.state.errors[i].message}</div>
                        <div className='close' onClick={() => this.hideError(i)}>Close</div>
                    </div>
               )}
            </div>
        );
    }
}

export default ErrorBox