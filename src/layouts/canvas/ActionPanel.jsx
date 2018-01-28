import React, { Component } from 'react'
import BuyPixelForm from '../forms/BuyPixelForm.jsx';
import SetPixelColorForm from '../forms/SetPixelColorForm';
import SellPixelForm from '../forms/SellPixelForm';
import Pullout from '../ui/Pullout';
import PulloutTab from '../ui/PulloutTab';
import GetPixelColorForm from '../forms/GetPixelColorForm';
import * as Assets from '../../const/assets.jsx';
import SetHoverText from '../forms/SetHoverText';
import SetLink from '../forms/SetLink';

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
                    <PulloutTab icon={Assets.ICON_MONEY} tabName='Buy Property'>
                        <BuyPixelForm
                            valueX={this.props.clickX}
                            valueY={this.props.clickY}
                        />
                    </PulloutTab>
                    <PulloutTab icon={Assets.ICON_MONEY} tabName='Sell Property'>
                        <SellPixelForm
                            valueX={this.props.clickX}
                            valueY={this.props.clickY}
                        />
                    </PulloutTab>
                    <PulloutTab icon={Assets.ICON_MONEY} tabName='Update Property'>
                        <SetPixelColorForm
                            valueX={this.props.clickX}
                            valueY={this.props.clickY}
                        />
                    </PulloutTab>
                    <PulloutTab icon={Assets.ICON_MONEY} tabName='Set Property Info'>
                        <SetHoverText/>
                        <SetLink/>
                    </PulloutTab>
                    <PulloutTab icon={Assets.ICON_MONEY} tabName='Exchange Currency'>
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