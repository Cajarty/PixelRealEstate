import React, { Component } from 'react'

export class Panel extends Component {
    render() {
        return (
            <div className='panel'>
                {this.props.children}
            </div>
        );
    }
}

export class PanelItem extends Component {
    render() {
        return (<div className='panelItem' style={{width: this.props.width}}>{this.props.data}</div>);
    }
}

export class PanelCanvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scale: 1,
        };
    }

    componentDidMount() {
        let ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.scale(this.props.width, this.props.width);
        this.setState({ ctx });
        this.setCanvas(this.props.imageData);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.imageData !== this.props.imageData)
            this.setCanvas(newProps.imageData);
        if (newProps.width != this.props.width) {
            this.ctx.scale(1/this.state.scale, 1/this.state.scale);
            this.ctx.scale(newProps.width, newProps.width);
            this.setState({scale: newProps.width});
        }
    }

    setCanvas(rgbArr) {
        let ctxID = this.state.ctx.createImageData(10, 10);
        for (let i = 0; i < Object.keys(rgbArr).length; i++) {
            for (let j = 0; j < rgbArr[i].length; j++) {
                ctxID.data[i * rgbArr[i].length + j] = rgbArr[i][j];
            }
        }
        this.state.ctx.putImageData(ctxID, 0, 0);
    }

    render() {
        return (
            <canvas 
                className='panelCanvas'
                width={this.props.width} 
                height={this.props.width}
                ref={(canvas) => { this.canvas = canvas; }} 
            ></canvas>
        );
    }
}