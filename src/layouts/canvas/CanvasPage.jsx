import React, { Component } from 'react'
import Canvas from './Canvas.jsx'
import ManagePanel from './ManagePanel.jsx'

class CanvasPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className='left panel'>
                    <ManagePanel/>
                </div>
                <div className='center panel'>
                    <Canvas/>
                </div>
                <div className='left panel'>

                </div>
            </div>
        );
    }
}

export default CanvasPage