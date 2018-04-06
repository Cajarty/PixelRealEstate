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
import * as Func from '../../functions/functions';

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
            pageSize: 0, //how many elements per page?
        };
        this.cancelSort = false;
    }

    componentDidMount() {
        this.props.isLoading(true);

        //fix updates to be better, add params
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
        let container = document.querySelector('.itemContainer');
        if (!container)
            return;
        let containerWidth = container.clientWidth;
        let pageSize = Math.floor(containerWidth / ITEM_SIZE);
        let size = (e.size != null ? e.size : this.state.items);
        this.setState({
            pageSize: (pageSize >= this.state.items ? this.state.items : pageSize),
        });
        this.forceUpdate();
    }

    async reorderItems(orderFunc) {
        //get my current market trade and populate fields
        let results = await SDM.orderPropertyList(SDM.forSaleProperties, orderFunc);
        if (results == null)
            return;
        this.setState({
            orderedItems: results, 
            items: results.length,
        });
        this.props.isLoading(false);
        this.onResize({size: results.length});
    }

    componentWillUnmount() {
        this.cancelSort = true;
        window.removeEventListener('resize', this.onResize);
        this.state.eventHandle.stopWatching();
    }

    handleInput(key, value) {
        let obj = {};
        obj[key] = value;
        this.setState(obj);
    }

    propertySelected(x, y) {
        GFD.setData('x', x);
        GFD.setData('y', y);
        Func.ScrollTo(Func.PAGES.TOP);
    }

    changePage(up = true) {
        let item = this.state.itemIndex + (up ? this.state.pageSize : -this.state.pageSize);
        if (item < 0)
            item += this.state.items;
        if (item >= this.state.items)
            item -= this.state.items;
        this.setState({itemIndex: item});       
        this.forceUpdate();
    }

    reorderList(value) {
        this.setState({compare: Compares[value.value]});
        this.reorderItems(Compares[value.value].func);
    }

    render() {
        if (this.state.orderedItems.length == 0)
            return (<h3 className='noContent'>None Yet!</h3>);
        return (
            <div style={{height: '100%'}}>
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