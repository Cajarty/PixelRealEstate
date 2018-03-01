import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';

class SetHoverText extends Component {
    constructor(props) {
        super(props);
        this.state = {
            linkText: '',
        };
    }

    componentDidMount() {
        ctr.getLink(ctr.account[0], (data) => {
            this.setState({linkText: Func.HexToString(data[0]) + Func.HexToString(data[1])});
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
                                Set Property Link:
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='inputTitle'>Link</div>
                            <input id='linkText' type='text' onChange={(e) => this.handleInput('linkText', e.target.value)} value={this.state.linkText}></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input type='button' value='Set Link' onClick={() => ctr.setLink(this.state.linkText)}></input>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default SetHoverText