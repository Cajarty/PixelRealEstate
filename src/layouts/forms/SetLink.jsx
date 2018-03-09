import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';

class SetHoverText extends Component {
    constructor(props) {
        super(props);
        this.state = {
            linkText: 'http://',
        };
    }

    componentDidMount() {
        ctr.getLink(ctr.account, (data) => {
            this.setState({linkText: data});
        });
    }

    handleInput(key, value) {
        let obj = {};
        if (!/^https?:\/\//i.test(value)) {
            value = 'http://' + value;
        }
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
                            <input 
                                id='linkText' 
                                type='text' 
                                maxLength={64} 
                                onChange={(e) => this.handleInput('linkText', e.target.value)} 
                                value={this.state.linkText}
                            ></input>
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