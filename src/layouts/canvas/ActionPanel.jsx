import React, { Component } from 'react'
import BuyPixelForm from '../forms/BuyPixelForm.jsx';
import SetPixelColorForm from '../forms/SetPixelColorForm';

class ActionPanel extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className='contractAction'>
                    <BuyPixelForm/>
                    <SetPixelColorForm/>
                </div>
            </div>
        );
    }
}

export default ActionPanel