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
                <div className='left'>
                    <ManagePanel/>
                </div>
                <div className='center'>
                    <Canvas/>
                </div>
                <div className='right'>
                    <ActionPanel/>
                </div>
            </div>
        );
    }
}

export default CanvasPage