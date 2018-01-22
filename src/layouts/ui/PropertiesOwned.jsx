import React, { Component } from 'react';
import {Contract, ctr, EVENTS} from '../../contract/contract.jsx';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import TimeAgo from 'react-timeago';

class PropertiesOwned extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        ctr.listenForEvent(EVENTS.PropertyBought, 'PropertiesOwned', (data) => {
            console.info(data);
        });
    }

    componentWillUnmount() {
        ctr.stopListeningForEvent(EVENTS.PropertyBought, 'PropertiesOwned');
    }

    render() {
        return (
            <div>
                 <table className='header'>
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
                <table id='data'>
                    <tbody>
                        {Object.keys(SDM.ownedProperties).map((x) =>
                            {return Object.keys(SDM.ownedProperties[x]).map((y) => 
                                <tr key={x * 100 + y}>
                                    <td style={{width: '10%'}}>{x}</td>
                                    <td style={{width: '10%'}}>{y}</td>
                                    <td style={{width: '20%'}}>{SDM.ownedProperties[x][y].isForSale ? 'Yes' : 'No'}</td>
                                    <td style={{width: '20%'}}>{SDM.ownedProperties[x][y].isInPrivate ? 'Yes' : 'No'}</td>
                                    <td style={{width: '40%'}}>
                                        {SDM.ownedProperties[x][y].lastColorUpdate == 0 ? 
                                            'Never' 
                                            : <TimeAgo date={SDM.ownedProperties[x][y].lastColorUpdate}/>
                                        }
                                    </td>
                                </tr>
                            )}
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default PropertiesOwned