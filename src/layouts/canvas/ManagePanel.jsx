import React, { Component } from 'react'
import PixelDescriptionBox from '../ui/PixelDescriptionBox.jsx';
import PixelsOwned from '../ui/PixelsOwned.jsx';
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
                <PixelDescriptionBox
                    x={10}
                    y={10}
                    color={'FF0000'}
                    owner={'myself'}
                    forSale={0}
                    forRent={0}
                ></PixelDescriptionBox>
                <PixelsOwned
                
                ></PixelsOwned>
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