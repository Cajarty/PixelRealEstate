import React, { Component } from 'react'
import {Panel, PanelItem, PanelPropertyCanvas, PanelDivider} from './Panel';
import PanelContainer from './PanelContainer';
import Timestamp from 'react-timestamp';
import Hours from '../ui/Hours';

class PanelContainerForSale extends PanelContainer {
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
                        <PanelItem width='40%' title data='PPT Price:'/>
                        <PanelItem width='60%' data={child.PPCPrice}/>
                        {child.ETHPrice !== 0 ? <PanelItem width='40%' title data='ETH Price:'/> :null}
                        {child.ETHPrice !== 0 ? <PanelItem width='60%' data={child.ETHPrice}/> :null}
                    </Panel>
                ))}
            </div>
        );
    }
}
export default PanelContainerForSale