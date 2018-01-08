import React, { Component } from 'react'
import BuyPixelForm from '../forms/BuyPixelForm.jsx';

class ActionPanel extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className='contractAction'>
                    <BuyPixelForm/>
                </div>
            </div>
        );
    }
}

export default ActionPanel