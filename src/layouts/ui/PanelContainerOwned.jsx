import React, { Component } from 'react'
import {Panel, PanelItem, PanelPropertyCanvas} from './Panel';
import PanelContainer from './PanelContainer';
import Timestamp from 'react-timestamp';

class PanelContainerOwned extends PanelContainer {
    constructor(props) {
        super(props);
        this.state = {
            dataView: []
        }
    }

    render() {
        return (
            <div className='panelContainer'>
                {this.state.dataView.map((child, i) => (
                    <Panel onClick={() => {console.info(child);this.props.onClick(child.x, child.y)}} key={i}>
                        <PanelPropertyCanvas x={child.x} y={child.y} width={20} imageData={child.imageData}/>
                        <PanelItem width='10%' data='X:'/>
                        <PanelItem width='30%' data={child.x}/>
                        <PanelItem width='10%' data='Y:'/>
                        <PanelItem width='30%' data={child.y}/>
                        <PanelItem width='30%' data='For Sale'/>
                        <PanelItem width='20%' data={child.isForSale ? 'Yes' : 'No'}/>
                        <PanelItem width='30%' data='Private'/>
                        <PanelItem width='20%' data={child.isInPrivate ? 'Yes' : 'No'}/>
                        <PanelItem width='50%' data='Last Update'/>
                        <PanelItem width='50%' data={child.lastUpdate > 0 ? <Timestamp time={child.lastUpdate} autoUpdate precision={2}/> : 'Never'}/>
                    </Panel>
                ))}
            </div>
        );
    }
}
export default PanelContainerOwned