import React, { Component } from 'react'
import {Panel, PanelItem, PanelCanvas} from './Panel';
import PanelContainer from './PanelContainer';

class PanelContainerOwned extends PanelContainer {
    constructor(props) {
        super(props);
        this.state = {
            dataView: []
        }
    }

    render() {
        return (
            <div>
                {this.state.dataView.map((child, i) => (
                    <Panel key={i}>
                        <PanelCanvas width='20%' imageData={child.imageData}/>
                        <PanelItem width='10%' data='X:'/>
                        <PanelItem width='30%' data={child.x}/>
                        <PanelItem width='10%' data='Y:'/>
                        <PanelItem width='30%' data={child.y}/>
                    </Panel>
                ))}
            </div>
        );
    }
}
export default PanelContainerOwned