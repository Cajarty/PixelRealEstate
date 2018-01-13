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
                    <Pullout top={10} side='right'>
                        <BuyPixelForm/>
                    </Pullout>
                    <Pullout top={30} side='right'>
                        <SellPixelForm/>
                    </Pullout>
                    <Pullout top={50} side='right'>
                        <SetPixelColorForm/>
                    </Pullout>
                    <Pullout top={70} side='right'>
                        <GetPixelColorForm/>
                    </Pullout>
                </div>
            </div>
        );
    }
}

export default ActionPanel