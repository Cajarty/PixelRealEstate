import React, { Component } from 'react';
import {Contract, ctr, EVENTS, LISTENERS} from '../../contract/contract.jsx';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import TimeAgo from 'react-timeago';

class PropertiesForSale extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showPopertiesForSale: false,
        }
    }

    componentDidMount() {
        ctr.listenForEvent(EVENTS.PropertySetForSale, 'PropertiesForSale', (data) => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        ctr.stopListeningForEvent(EVENTS.PropertySetForSale, 'PropertiesForSale');
    }

    propertySelected(x, y) {
        ctr.sendResults(LISTENERS.CoordinateUpdate, {x, y});
    }

    toggleCanvasProperties(value) {
        this.setState({showPopertiesForSale: value});
        ctr.sendResults(LISTENERS.ShowForSale, {show: value});
    }

    render() {
        return (
            <div>
                Show for sale properties on canvas 
                <label className="switch">
                    <input 
                        type="checkbox" 
                        checked={this.state.showPopertiesForSale} 
                        onChange={(e) => this.toggleCanvasProperties(e.target.checked)}
                    ></input>
                    <span className="slider"></span>
                </label>
                <table className='header'>
                    <thead>
                        <tr>
                            <td style={{width: '15%'}}>{'X'}</td>
                            <td style={{width: '15%'}}>{'Y'}</td>
                            <td style={{width: '35%'}}>{'ETH Price'}</td>
                            <td style={{width: '35%'}}>{'PXL Price'}</td>
                        </tr>
                    </thead>
                </table>
                <div className='tableData'>
                    <table className='data'>
                        <tbody>
                            {Object.keys(SDM.ownedProperties).map((x) =>
                                {return Object.keys(SDM.ownedProperties[x]).map((y) => 
                                    <tr key={x * 100 + y} onClick={() => this.propertySelected(x, y)}>
                                        <td style={{width: '15%'}}>{x}</td>
                                        <td style={{width: '15%'}}>{y}</td>
                                        <td style={{width: '35%'}}>{SDM.ownedProperties[x][y].salePriceETH == 0 ? 'N/A' : SDM.ownedProperties[x][y].salePriceETH}</td>
                                        <td style={{width: '35%'}}>{SDM.ownedProperties[x][y].salePricePXL == 0 ? 'N/A' : SDM.ownedProperties[x][y].salePricePXL}</td>
                                    </tr>
                                )}
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default PropertiesForSale