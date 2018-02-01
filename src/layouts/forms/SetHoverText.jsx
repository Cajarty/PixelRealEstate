import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';
import * as web3 from 'web3';

class SetHoverText extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverText: '',
        };
    }

    componentDidMount() {
        ctr.getHoverText(ctr.account, (data) => {
            console.info(data);
            this.setState({hoverText: Func.HexToString(data[0]) + Func.HexToString(data[1])});
        });
    }

    handleInput(key, value) {
        let obj = {};
        obj[key] = value;
        this.setState(obj);
    }

    render() {
        return (
            <table cellSpacing={0} cellPadding={0} className='form'>
                <tbody>
                    <tr>
                        <td>
                            <div className='title'>
                                Set Hover Text:
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'> Y: </div>
                            <input 
                                id='hoverText' 
                                maxLength={64} 
                                type='text' 
                                onChange={(e) => this.handleInput('hoverText', e.target.value)} 
                                value={this.state.hoverText}
                            ></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input type='button' value='Set Hover Text' onClick={() => ctr.setHoverText(this.state.hoverText)}></input>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default SetHoverText