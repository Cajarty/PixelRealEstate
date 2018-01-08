import React, { Component } from 'react'


import './ui.css'

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
                {this.props.ownedPixels.map((pixel) =>
                    <tr>
                        <td>{pixel.x}</td>
                        <td>{pixel.y}</td>
                    </tr>
                )}
                </table>
            </div>
        );
    }
}

export default PixelDescriptionBox