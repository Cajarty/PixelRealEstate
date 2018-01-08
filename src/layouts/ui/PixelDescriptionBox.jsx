import React, { Component } from 'react'


import './PixelDescriptionBox.css'

class PixelDescriptionBox extends Component {
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
                    <tr>
                        <th>X</th>
                        <td>{this.props.x}</td>
                    </tr>
                    <tr>
                        <th>Y</th>
                        <td>{this.props.y}</td>
                    </tr>
                    <tr>
                        <th>Color</th>
                        <td>{this.props.color}</td>
                    </tr>
                    <tr>
                        <th>Owner</th>
                        <td>{this.props.owner}</td>
                    </tr>
                    <tr>
                        <th>For Sale</th>
                        <td>{this.props.forSale}</td>
                    </tr>
                    <tr>
                        <th>For Rent</th>
                        <td>{this.props.forRent}</td>
                    </tr>
                </table>
            </div>
        );
    }
}

export default PixelDescriptionBox