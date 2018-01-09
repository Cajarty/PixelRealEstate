import React, { Component } from 'react'
import Canvas from './Canvas.jsx'
import ManagePanel from './ManagePanel.jsx'
import ActionPanel from './ActionPanel.jsx'
import {Contract, ctr} from '../../contract/contract.jsx';

class CanvasPage extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
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
                <div className='right panel'>
                    <ActionPanel/>
                </div>
            </div>
        );
    }
}

export default CanvasPage