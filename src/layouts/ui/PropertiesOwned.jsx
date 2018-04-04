import React, { Component } from 'react';
import * as EVENTS from '../../const/events';
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import {SDM, ServerDataManager, Compares} from '../../contract/ServerDataManager.jsx';
import PanelContainerOwned from './PanelContainerOwned';
import * as Assets from '../../const/assets.jsx';
import Dropdown from 'react-dropdown';
import {GFD, GlobalState} from '../../functions/GlobalState';
import {Segment, Button, Icon} from 'semantic-ui-react';

const ITEM_SIZE = 140;

class PropertiesOwned extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orderedItems: [],
            compare: Compares.xDesc,
            itemIndex: 0, //on page #
            items: 0, //total pages
            pageSize: 0, //how many elements per page?
            maxPageSize: 0, //page size if there wasnt a max on the list
        };
        this.cancelSort = false;
    }

    componentDidMount() {
        this.props.isLoading(true);

        //add right owner
        ctr.watchEventLogs(EVENTS.PropertyBought, {}, (eventHandle) => {
            this.setState({eventHandle});
            eventHandle.watch((error, log) => {
                this.reorderItems();
                this.forceUpdate();
            });
        });
        this.reorderItems();
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
            maxPageSize: pageSize,
            pageSize: (pageSize >= this.state.items ? this.state.items : pageSize),
        });
        this.forceUpdate();
    }

    async reorderItems() {
        console.info(SDM.ownedProperties);
        //get my current market trade and populate fields
        let results = await SDM.orderPropertyList(SDM.ownedProperties, this.state.compare.func);
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
        if (this.state.orderedItems.length == 0)
            return (<h3 className='noContent'>None Yet!</h3>);
        else 
            return (
                <div style={{height: '100%'}}>
                    <Button attached='top' onClick={() => {this.changePage(true)}}><Icon name='chevron up'></Icon></Button>
                    <Segment attached style={{height: 'calc(100% - 74px)'}} className='itemContainer'>
                        <PanelContainerOwned
                            data={this.state.orderedItems}
                            onClick={(x, y) => this.propertySelected(x, y)}
                            viewStart={this.state.itemIndex}
                            viewEnd={this.state.itemIndex + this.state.pageSize}
                            maxPageSize={this.state.maxPageSize}
                        />
                    </Segment>
                    <Button attached='bottom' onClick={() => {this.changePage(false)}}><Icon name='chevron down'></Icon></Button>
                </div>
            );
    }
}

export default PropertiesOwned