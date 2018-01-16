import React, { Component } from 'react'
import PixelDescriptionBox from '../ui/PixelDescriptionBox.jsx';
import PixelsOwned from '../ui/PixelsOwned.jsx';
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
                                x={10}
                                y={10}
                                color={'FF0000'}
                                owner={'myself'}
                                forSale={0}
                                forRent={0}
                            ></PixelDescriptionBox>
                        </PulloutTab>
                        <PulloutTab icon={Assets.ICON_MONEY} tabName='View Sell Offers'>
                            <PixelsOwned
                                ownedProperty={{0: {x: 0, y: 0}}}
                            ></PixelsOwned>
                        </PulloutTab>
                        <PulloutTab icon={Assets.ICON_MONEY} tabName='View Coin Offers'>
                            
                        </PulloutTab>
                        <PulloutTab icon={Assets.ICON_MONEY} tabName='Owned'>
                            
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