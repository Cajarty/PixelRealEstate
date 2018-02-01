import React, { Component } from 'react'
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';

export class Panel extends Component {
    render() {
        return (
            <div onClick={() => this.props.onClick()} className='panel'>
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

export class PanelPropertyCanvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ctx: null,
            scale: 1,
        };
    }

    componentDidMount() {
        let ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        this.setState({ ctx });
        this.setCanvas(SDM.getPropertyImage(this.props.x, this.props.y));
    }

    componentWillReceiveProps(newProps) {
        this.setCanvas(SDM.getPropertyImage(this.props.x, this.props.y));
    }

    setCanvas(rgbArr) {
        let ctx = this.state.ctx;
        if (ctx == null) {
            ctx = this.canvas.getContext("2d");
        }

        let ctxID = ctx.createImageData(10, 10);
        for (let i = 0; i < 400; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        ctx.putImageData(ctxID, 0, 0)
        ctx.scale(this.props.width / 10, this.props.width / 10);
        this.setState({ ctx, scale: this.props.width });
        ctx.drawImage(this.canvas, 0, 0);
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