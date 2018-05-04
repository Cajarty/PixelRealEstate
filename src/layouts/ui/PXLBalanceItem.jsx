import React, { Component } from 'react';
import * as Assets from '../../const/assets';
import {Contract, ctr} from '../../contract/contract.jsx';
import { Item, ItemGroup, ItemImage , ItemContent, Button} from 'semantic-ui-react';
import * as Func from '../../functions/functions.jsx';
import {GFD, GlobalState, TUTORIAL_STATE} from '../../functions/GlobalState';

class PXLBalanceItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingPPC: true,
            PPCOwned: 0,
        }
    }

    componentDidMount() {
        GFD.listen('balance', 'PXLBalanceItem', (PPCOwned) => {
            this.setState({PPCOwned, loadingPPC: false});
        });
    }

    updateBalance() {
        this.setState({loadingPPC: true});
        ctr.getBalance((balance) => {
            GFD.setData('balance', balance);
            this.setState({PPCOwned: balance, loadingPPC: false});
        });
    }

    componentWillUnmount() {
        GFD.closeAll('PXLBalanceItem');
    }

    render() {
        return(
        <ItemGroup>
            <Item className='pixelsOwnedItem'>
                <ItemImage size='mini' src={this.state.loadingPPC ? Assets.LOADING : Assets.TOKEN} />
                <ItemContent verticalAlign='middle'>{Func.NumberWithCommas(this.state.PPCOwned)} </ItemContent>
                <Item.Extra><Button compact className='buttonRefreshBalance' icon='refresh' floated='right' onClick={() => this.updateBalance()}/></Item.Extra>
            </Item>
        </ItemGroup>
        );
    }
}

export default PXLBalanceItem