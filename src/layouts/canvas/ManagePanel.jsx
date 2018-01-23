import React, { Component } from 'react'
import PixelDescriptionBox from '../ui/PixelDescriptionBox.jsx';
import PropertiesOwned from '../ui/PropertiesOwned.jsx';
import Pullout from '../ui/Pullout';
import PulloutTab from '../ui/PulloutTab';
import * as Assets from '../../const/assets.jsx';
// import PixelsRented from '../ui/PixelsRented.jsx';
// import PixelsForSale from '../ui/PixelsForSale.jsx';
// import PixelsForRent from '../ui/PixelsForRent.jsx';

class ManagePanel extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className='contractAction'>
                    <Pullout side='left' >
                        <PulloutTab icon={Assets.ICON_MONEY} tabName='Inspect'>
                            <PixelDescriptionBox
                                x={this.props.clickX}
                                y={this.props.clickY}
                            ></PixelDescriptionBox>
                        </PulloutTab>
                        <PulloutTab icon={Assets.ICON_MONEY} tabName='Owned'>
                            <PropertiesOwned/>
                        </PulloutTab>
                        <PulloutTab icon={Assets.ICON_MONEY} tabName='Property Market'>
                            
                        </PulloutTab>
                        <PulloutTab icon={Assets.ICON_MONEY} tabName='Coin Market'>
                            
                        </PulloutTab>
                    </Pullout>
                </div>
            </div>
        );
    }
}

export default ManagePanel



/*

<div className='contractAction'>
                    <PixelsOwned/>
                </div>
                <div className='contractAction'>
                    <PixelsRented/>
                </div>
                <div className='contractAction'>
                    <PixelsForSale/>
                </div>
                <div className='contractAction'>
                    <PixelsForRent/>
                </div>
                */