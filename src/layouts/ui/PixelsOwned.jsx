import React, { Component } from 'react'

class PixelsOwned extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                 <table className='header'>
                    <thead>
                        <tr>
                            <td style={{width: '25%'}}>{'Preview'}</td>
                            <td style={{width: '25%'}}>{'X'}</td>
                            <td style={{width: '25%'}}>{'Y'}</td>
                            <td style={{width: '25%'}}>{'Price'}</td>
                        </tr>
                    </thead>
                </table>
                <table id='data'>
                    <tbody>
                        {Object.keys(this.props.ownedProperty).map((i) =>
                            <tr key={i}>
                                <td style={{width: '25%'}}>{'Preview'}</td>
                                <td style={{width: '25%'}}>{this.props.ownedProperty[i].x}</td>
                                <td style={{width: '25%'}}>{this.props.ownedProperty[i].y}</td>
                                <td style={{width: '25%'}}>{this.props.ownedProperty[i].price}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default PixelsOwned