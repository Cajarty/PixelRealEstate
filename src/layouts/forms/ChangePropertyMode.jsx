import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';

const TOKENS_TO_MINUTES = 1;

class ChangePropertyMode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
            isPrivate: false,
            minutesPrivate: 0,
            tokenCost: 0,
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
        GFD.listen('x', 'ChangePropertyMode', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'ChangePropertyMode', (y) => {
            this.setState({y});
            this.setState({
                isPrivate: SDM.getPropertyData(GFD.getData('x') - 1, y - 1).isPrivate,
                becomePublic: SDM.getPropertyData(GFD.getData('x') - 1, y - 1).becomePublic 
            });
            ctr.getPropertyData(GFD.getData('x') - 1, y - 1, (data) => {
                console.info(data);
                this.setState({
                    isPrivate: data[4],
                    becomePublic: data[5]
                });
            });
        })
    }

    componentWillUnmount() {
        GFD.closeAll('ChangePropertyMode');
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
    }

    setPropertyMode() {
        let x = GFD.getData('x') - 1;
        let y = GFD.getData('y') - 1;
        if (SDM.getPropertyData(x, y).becomePublic) {
            ctr.sendResults(LISTENERS.Alert, {result: false, message: "Property is temorarily reserved by a user."});
            return;
        }
        if (SDM.getPropertyData(x, y).becomePublic) {
            ctr.sendResults(LISTENERS.Alert, {result: false, message: "Property is already in private mode."});
            return;
        }
        ctr.setPropertyMode(x, y, true, this.state.minutesPrivate, () => {
            console.info("Mode toggled, confirmed through a transaction");
        })
    }


    changeTokens(t) {
        this.setState({
            tokenCost: t,
            minutesPrivate: t * TOKENS_TO_MINUTES
        })
    }

    changeTime(t) {
        this.setState({
            tokenCost: t * (1 / TOKENS_TO_MINUTES),
            minutesPrivate: t
        })
    }

    render() {
        return (
            <table cellSpacing={0} cellPadding={0} className='form'>
                <tbody>
                    <tr>
                        <td colSpan={2}>
                            <div className='title'>
                                Set Property Private:
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
                            <div className='inputTitle'>PPT:</div>
                        </td>
                        <td>
                            <div className='inputTitle'>Time (Minutes):</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input id='tokens' type='number' onChange={(e) => this.changeTokens(e.target.value)} value={this.state.tokenCost}></input>
                        </td>
                        <td>
                            <input id='time' type='number' onChange={(e) => this.changeTime(e.target.value)} value={this.state.minutesPrivate}></input>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <div>{this.state.isPrivate ? "This Property is already in private mode." : ""}</div>
                            <div>{this.state.becomePublic != 0 ? "This Property is temporarily reserved by a user." : ""}</div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <input type='button' value='Set Property' onClick={() => ctr.setPropertyMode()}></input>
                        </td>
                    </tr>
                </tbody>
                
            </table>
        );
    }
}

export default ChangePropertyMode