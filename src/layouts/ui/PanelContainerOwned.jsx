import React, { Component } from 'react'
import {Panel, PanelItem, PanelPropertyCanvas, PanelDivider} from './Panel';
import PanelContainer from './PanelContainer';
import Timestamp from 'react-timestamp';
import Hours from '../ui/Hours';

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
                    <Panel onClick={() => {this.props.onClick(child.x + 1, child.y + 1)}} key={i}>
                        <PanelPropertyCanvas x={child.x} y={child.y} width={20} imageData={child.imageData}/>
                        <PanelItem width='10%'/>
                        <PanelItem width='10%' title data='X:'/>
                        <PanelItem width='35%' data={child.x + 1}/>
                        <PanelItem width='10%' title data='Y:'/>
                        <PanelItem width='15%' data={child.y + 1}/>
                        <PanelDivider/>
                        <PanelItem width='30%' title data='For Sale'/>
                        <PanelItem width='20%' data={child.isForSale ? 'Yes' : 'No'}/>
                        <PanelItem width='30%' title data='Private'/>
                        <PanelItem width='20%' data={child.isInPrivate ? 'Yes' : 'No'}/>
                        <PanelItem width='50%' title data='Last Update'/>
                        <PanelItem width='50%' data={child.lastUpdate != null && child.lastUpdate > 0 ? <Hours time={child.lastUpdate} /> : 'Never'}/>
                    </Panel>
                ))}
            </div>
        );
    }
}
export default PanelContainerOwned