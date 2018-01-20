import React, { Component } from 'react'
import BuyPixelForm from '../forms/BuyPixelForm.jsx';
import SetPixelColorForm from '../forms/SetPixelColorForm';
import SellPixelForm from '../forms/SellPixelForm';
import Pullout from '../ui/Pullout';
import PulloutTab from '../ui/PulloutTab';
import GetPixelColorForm from '../forms/GetPixelColorForm';
import * as Assets from '../../const/assets.jsx';

class ActionPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <div>
                <div className='contractAction'>
                 <Pullout side='right' >
                    <PulloutTab icon={Assets.ICON_MONEY} tabName='Buy'>
                        <BuyPixelForm
                            valueX={this.props.clickX}
                            valueY={this.props.clickY}
                        />
                    </PulloutTab>
                    <PulloutTab icon={Assets.ICON_MONEY} tabName='Sell'>
                        <SellPixelForm
                            valueX={this.props.clickX}
                            valueY={this.props.clickY}
                        />
                    </PulloutTab>
                    <PulloutTab icon={Assets.ICON_MONEY} tabName='Update'>
                        <SetPixelColorForm
                            valueX={this.props.clickX}
                            valueY={this.props.clickY}
                        />
                    </PulloutTab>
                    <PulloutTab icon={Assets.ICON_MONEY} tabName='Set Status'>
                        <GetPixelColorForm
                            valueX={this.props.clickX}
                            valueY={this.props.clickY}
                        />
                    </PulloutTab>
                 </Pullout>
                </div>
            </div>
        );
    }
}

export default ActionPanel