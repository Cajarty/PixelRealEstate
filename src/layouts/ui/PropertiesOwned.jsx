import React, { Component } from 'react';
import {Contract, ctr, EVENTS, LISTENERS} from '../../contract/contract.jsx';
import {SDM, ServerDataManager, Compares} from '../../contract/ServerDataManager.jsx';
import PanelContainerOwned from './PanelContainerOwned';
import * as Assets from '../../const/assets.jsx';

const PAGE_SIZE = 4;

class PropertiesOwned extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orderedItems: [],
            compare: Compares.xDesc,
            page: 0, //on page #
            pages: 0, //total pages
        };
        this.cancelSort = false;
    }

    componentDidMount() {
        ctr.listenForEvent(EVENTS.PropertyBought, 'PropertiesOwned', (data) => {
            this.reorderItems();
            this.forceUpdate();
        });
        this.reorderItems();
    }

    reorderItems() {
        //get my current market trade and populate fields
        let promise = SDM.orderPropertyListAsync(SDM.ownedProperties, this.state.compare.func);

        let relisten = (results) => {
            this.setState({
                orderedItems: results.data, 
                pages: Math.floor(results.data.length / PAGE_SIZE)});
            if (results.promise && !this.cancelSort)
                results.promise.then(relisten);
        }

        promise.then(relisten);
    }

    componentWillUnmount() {
        this.cancelSort = true;
        ctr.stopListeningForEvent(EVENTS.PropertyBought, 'PropertiesOwned');
    }

    handleInput(key, value) {
        let obj = {};
        obj[key] = value;
        this.setState(obj);
    }

    propertySelected(x, y) {
        ctr.sendResults(LISTENERS.CoordinateUpdate, {x, y});
    }

    changePage(pageChange) {
        let page = this.state.page + pageChange;
        if (page <= 0)
            page = 0;
        if (page > this.state.pages)
            page = this.state.pages;
            console.info(page);
        this.setState({page});        
    }

    render() {
        return (
            <div className='uiBase'>
                <div className='header'>
                    Some important info right here
                </div>
                <div className='containerParent'>
                    <PanelContainerOwned
                        data={this.state.orderedItems}
                        onClick={(x, y) => this.propertySelected(x, y)}
                        viewStart={this.state.page * PAGE_SIZE}
                        viewEnd={(this.state.page + 1) * PAGE_SIZE}
                    />
                </div>
                <div className='footer'>
                    <div className='bottomNav' onClick={() => this.changePage(-1)}>
                        <img className='icon' src={Assets.ICON_LEFT_ARROW}></img>
                    </div>
                    <div className='bottomNav'>
                        {(this.state.page + 1) + ' / ' + (this.state.pages + 1)}
                    </div>
                    <div className='bottomNav' onClick={() => this.changePage(1)}>
                        <img className='icon' src={Assets.ICON_RIGHT_ARROW}></img>
                        </div>
                </div>
            </div>
        );
}

    // render() {
    //     return (
    //         <div>
    //              <table cellSpacing={0} cellPadding={0} className='header'>
    //                 <thead>
    //                     <tr>
    //                         <td style={{width: '10%'}}>{'X'}</td>
    //                         <td style={{width: '10%'}}>{'Y'}</td>
    //                         <td style={{width: '20%'}}>{'For Sale'}</td>
    //                         <td style={{width: '20%'}}>{'Private'}</td>
    //                         <td style={{width: '40%'}}>{'Last Change'}</td>
    //                     </tr>
    //                 </thead>
    //             </table>
    //             <div className='tableData'>
    //                 <table cellSpacing={0} cellPadding={0} className='data'>
    //                     <tbody>
    //                         {Object.keys(SDM.ownedProperties).map((x) =>
    //                             {return Object.keys(SDM.ownedProperties[x]).map((y) => 
    //                                 <tr key={x * 100 + y} onClick={() => this.propertySelected(x, y)}>
    //                                     <td style={{width: '10%'}}>{x}</td>
    //                                     <td style={{width: '10%'}}>{y}</td>
    //                                     <td style={{width: '20%'}}>{SDM.ownedProperties[x][y].isForSale ? 'Yes' : 'No'}</td>
    //                                     <td style={{width: '20%'}}>{SDM.ownedProperties[x][y].isInPrivate ? 'Yes' : 'No'}</td>
    //                                     <td style={{width: '40%'}}>
    //                                         {SDM.ownedProperties[x][y].lastUpdate == null || SDM.ownedProperties[x][y].lastUpdate == 0 ? 
    //                                             'Never' 
    //                                             : <Timestamp time={SDM.ownedProperties[x][y].lastUpdate} autoUpdate precision={2}/>
    //                                         }
    //                                     </td>
    //                                 </tr>
    //                             )}
    //                         )}
    //                     </tbody>
    //                 </table>
    //             </div>
    //         </div>
    //     );
    // }
}

export default PropertiesOwned