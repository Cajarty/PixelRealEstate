import React, { Component } from 'react'

import './ui.css'

class PixelsOwned extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='panel '>
                <div>
                    <canvas id='colorPreviewCanvas'></canvas>
                </div>
                <table id='data'>
                    <tbody>
                        {Object.keys(this.props.ownedProperty).map((i) =>
                            <tr key={i}>
                                <td>{this.props.ownedProperty[i].x}</td>
                                <td>{this.props.ownedProperty[i].y}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default PixelsOwned