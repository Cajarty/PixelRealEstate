import React, { Component } from 'react';
import {Contract, ctr, EVENTS, LISTENERS} from '../../contract/contract.jsx';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import Timestamp from 'react-timestamp';

class PropertiesOwned extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        ctr.listenForEvent(EVENTS.PropertyBought, 'PropertiesOwned', (data) => {
            this.forceUpdate();
        });
        console.info("ordered", SDM.orderPropertyList(SDM.ownedProperties, (a, b) => {return a.y > b.y;}));
    }

    componentWillUnmount() {
        ctr.stopListeningForEvent(EVENTS.PropertyBought, 'PropertiesOwned');
    }

    propertySelected(x, y) {
        ctr.sendResults(LISTENERS.CoordinateUpdate, {x, y});
    }

    render() {
        return (
            <div>
                 <table cellSpacing={0} cellPadding={0} className='header'>
                    <thead>
                        <tr>
                            <td style={{width: '10%'}}>{'X'}</td>
                            <td style={{width: '10%'}}>{'Y'}</td>
                            <td style={{width: '20%'}}>{'For Sale'}</td>
                            <td style={{width: '20%'}}>{'Private'}</td>
                            <td style={{width: '40%'}}>{'Last Change'}</td>
                        </tr>
                    </thead>
                </table>
                <div className='tableData'>
                    <table cellSpacing={0} cellPadding={0} className='data'>
                        <tbody>
                            {Object.keys(SDM.ownedProperties).map((x) =>
                                {return Object.keys(SDM.ownedProperties[x]).map((y) => 
                                    <tr key={x * 100 + y} onClick={() => this.propertySelected(x, y)}>
                                        <td style={{width: '10%'}}>{x}</td>
                                        <td style={{width: '10%'}}>{y}</td>
                                        <td style={{width: '20%'}}>{SDM.ownedProperties[x][y].isForSale ? 'Yes' : 'No'}</td>
                                        <td style={{width: '20%'}}>{SDM.ownedProperties[x][y].isInPrivate ? 'Yes' : 'No'}</td>
                                        <td style={{width: '40%'}}>
                                            {SDM.ownedProperties[x][y].lastUpdate == null || SDM.ownedProperties[x][y].lastUpdate == 0 ? 
                                                'Never' 
                                                : <Timestamp time={SDM.ownedProperties[x][y].lastUpdate} autoUpdate precision={2}/>
                                            }
                                        </td>
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

export default PropertiesOwned