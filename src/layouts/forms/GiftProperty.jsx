import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';

class TransferProperty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
            valueNewOwner: '',
        };
    }

    componentWillReceiveProps(newProps) {
        let update = {};
        Object.keys(newProps).map((i) => {
            if (newProps[i] != this.props[i]) {
                update[i] = newProps[i];
            }
        });
        this.setState(update);
    }

    componentDidMount() {
        GFD.listen('x', 'transferProperty', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'transferProperty', (y) => {
            this.setState({y});
        })
    }

    componentWillUnmount() {
        GFD.closeAll('transferProperty');
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
    }

    handleNewOwner(newOwner) {
        this.setState({valueNewOwner: newOwner});
    }

    render() {
        return (
            <table cellSpacing={0} cellPadding={0} className='form'>
                <tbody>
                    <tr>
                        <td colSpan={2}>
                            <div className='title'>
                                Transfer Property:
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> X: </div>
                        </td>
                        <td>
                            <input 
                                id='sellPixelX' 
                                type='number' 
                                placeholder='1-100'
                                onChange={(e) => this.setX(e.target.value)} 
                                value={this.state.x}
                                ></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Y: </div>
                        </td>
                        <td>
                            <input 
                                id='sellPixelY' 
                                type='number' 
                                placeholder='1-100'
                                onChange={(e) => this.setY(e.target.value)} 
                                value={this.state.y}
                            ></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> New Owner: </div>
                        </td>
                        <td>
                            <input id='address' type='text' onChange={(e) => this.handleNewOwner(e.target.value)} value={this.state.valueNewOwner}></input>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <input type='button' value='Transfer Property' onClick={() => ctr.transferProperty(this.state.x - 1, this.state.y - 1, this.state.valueNewOwner, () => {})}></input>
                        </td>
                    </tr>
                </tbody>
                
            </table>
        );
    }
}

export default TransferProperty