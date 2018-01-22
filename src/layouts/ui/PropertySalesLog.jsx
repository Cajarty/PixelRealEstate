import React, { Component } from 'react'
import * as Func from '../../functions/functions.jsx';
import { EVENTS, Contract, ctr } from '../../contract/contract.jsx';


class PropertySalesLog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            salesLog: []
        }
    }

    componentDidMount() {
        ctr.listenForEvent(EVENTS.PropertyBought, 'PropertySalesLog', (data) => {
            let old = this.state.salesLog;
            let id = ctr.fromID(Func.BigNumberToNumber(data.args.property));
            let newData = {

                x: id.x,
                y: id.y,
                price: 0,
                newOwner: data.args.newOwner
            };
            old.unshift(newData);
            this.setState({ salesLog: old });
        });
    }

    componentWillUnmount() {
        ctr.stopListeningForEvent(EVENTS.PropertyBought, 'PropertySalesLog');
    }

    render() {
        return (
            <div className='tableDataContainer'>
                <div className='title'>
                    Sales History
                </div>
                <table className='header'>
                    <thead>
                        <tr>
                            <td style={{width: '8%'}}>{'X'}</td>
                            <td style={{width: '8%'}}>{'Y'}</td>
                            <td style={{width: '8%'}}>{'Price'}</td>
                            <td style={{width: '56%'}}>{'New Owner'}</td>
                            <td style={{width: '20%'}}>{'More info'}</td>
                        </tr>
                    </thead>
                </table>
                <div className='dataContainer'>
                    <table className='data'>
                        <tbody>
                            {this.state.salesLog.map((log) => (
                                <tr key={Math.random() + log.x + log.y}>
                                    <td style={{width: '8%'}}>{log.x}</td>
                                    <td style={{width: '8%'}}>{log.y}</td>
                                    <td style={{width: '8%'}}>{log.price}</td>
                                    <td style={{width: '56%'}}>{log.newOwner}</td>
                                    <td style={{width: '20%'}}>see more...</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default PropertySalesLog