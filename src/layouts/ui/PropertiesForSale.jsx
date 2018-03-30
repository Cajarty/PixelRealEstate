import React, { Component } from 'react';
import * as EVENTS from '../../const/events';
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import {SDM, ServerDataManager, Compares} from '../../contract/ServerDataManager.jsx';
import TimeAgo from 'react-timeago';
import PanelContainerOwned from './PanelContainerOwned';
import * as Assets from '../../const/assets.jsx';
import {GFD, GlobalState} from '../../functions/GlobalState';
import Dropdown from 'react-dropdown';
import PanelContainerForSale from './PanelContainerForSale';
import {Button, Segment, Icon} from 'semantic-ui-react';

const ITEM_SIZE = 140;

class PropertiesForSale extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showPopertiesForSale: false,
            orderedItems: [],
            compare: Compares.yAsc,
            itemIndex: 0, //on page #
            items: 0, //total pages
            pageSize: 2, //how many elements per page?
        };
        this.cancelSort = false;
        this.itemContainer = null;
    }

    componentDidMount() {
        this.props.isLoading(true);

        //fix updates to be better
        ctr.watchEventLogs(EVENTS.PropertySetForSale, {}, (handle) => {
            let eventHandle = handle;
            this.setState({eventHandle});
            eventHandle.watch((error, log) => {
                this.reorderItems(this.state.compare.func);
                this.forceUpdate();
            });
        });
        this.reorderItems(this.state.compare.func);
        window.addEventListener('resize', this.onResize);
    }

    onResize = (e) => {
        let containerWidth = document.querySelector('.itemContainer').clientWidth;
        let pageSize = Math.floor(containerWidth / ITEM_SIZE);
        let size = (e.size != null ? e.size : this.state.items);
        console.info((pageSize > this.state.items ? this.state.items : pageSize));
        this.setState({
            pageSize: (pageSize > this.state.items ? this.state.items : pageSize),
        });
        this.forceUpdate();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }

    async reorderItems(orderFunc) {
        //get my current market trade and populate fields
        let results = await SDM.orderPropertyList(SDM.forSaleProperties, orderFunc)
        this.setState({
            orderedItems: results, 
            items: results.length,
        });
        this.props.isLoading(false);
        this.onResize({size: results.length});
    }

    componentWillUnmount() {
        this.cancelSort = true;
        this.state.eventHandle.stopWatching();
    }

    handleInput(key, value) {
        let obj = {};
        obj[key] = value;
        this.setState(obj);
    }

    toggleCanvasProperties(value) {
        this.setState({showPopertiesForSale: value});
        ctr.sendResults(LISTENERS.ShowForSale, {show: value});
    }

    propertySelected(x, y) {
        GFD.setData('x', x);
        GFD.setData('y', y);
    }

    changePage(up = true) {
        let item = this.state.itemIndex + (up ? this.state.pageSize : -this.state.pageSize);
        if (item < 0)
            item += this.state.items;
        if (item >= this.state.items)
            item -= this.state.items;
        this.setState({itemIndex: item});        
    }

    reorderList(value) {
        this.setState({compare: Compares[value.value]});
        this.reorderItems(Compares[value.value].func);
    }

    render() {
        return (
            <div style={{height: '100%'}}>
                {null&& <label className="switch">
                    Show
                    <input 
                        type="checkbox" 
                        checked={this.state.showPopertiesForSale} 
                        onChange={(e) => this.toggleCanvasProperties(e.target.checked)}
                    ></input>
                    <span className="slider"></span>
                </label>}
               {null&& <div>
                    <Dropdown 
                        className='dropdown'
                        value={this.state.compare}
                        options={Object.keys(Compares).map((i) => {
                            return Compares[i];
                        })} 
                        onChange={value => {this.reorderList(value)}}
                    />
                </div>}
                <Button attached='top' onClick={() => {this.changePage(true)}}><Icon name='chevron up'></Icon></Button>
                <Segment attached style={{height: 'calc(100% - 74px)'}} className='itemContainer'>
                    <PanelContainerForSale
                        data={this.state.orderedItems}
                        onClick={(x, y) => this.propertySelected(x, y)}
                        viewStart={this.state.itemIndex}
                        viewEnd={this.state.itemIndex + this.state.pageSize}
                    />
                </Segment>
                <Button attached='bottom' onClick={() => {this.changePage(false)}}><Icon name='chevron down'></Icon></Button>
            </div>
        );
    }
}

export default PropertiesForSale;