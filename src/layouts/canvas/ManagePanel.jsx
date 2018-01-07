import React, { Component } from 'react'
import BuyPixelForm from '../forms/BuyPixelForm.jsx';

class ManagePanel extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className=''>
                    <BuyPixelForm/>
                </div>
            </div>
        );
    }
}

export default ManagePanel