import React, { Component } from 'react'
import BuyPixelForm from '../forms/BuyPixelForm.jsx';
import SetPixelColorForm from '../forms/SetPixelColorForm';
import SellPixelForm from '../forms/SellPixelForm';
import Pullout from '../ui/Pullout';
import GetPixelColorForm from '../forms/GetPixelColorForm';

class ActionPanel extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className='contractAction'>
                    <Pullout>
                    </Pullout>
                    <BuyPixelForm/>
                    <SellPixelForm/>
                    <SetPixelColorForm/>
                    <GetPixelColorForm/>
                </div>
            </div>
        );
    }
}

export default ActionPanel