import React, { Component } from 'react'
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import {ctr, Contract, EVENTS} from '../../contract/contract';
import * as Func from '../../functions/functions';

export class Panel extends Component {
    render() {
        return (
            <div onClick={() => this.props.onClick()} className='panel'>
                {this.props.children}
            </div>
        );
    }
}

export class PanelButton extends Component {
    render() {
        return (<input type='button' className={'panelButton'} style={{width: this.props.width}} onClick={() => this.props.onClick()} value={this.props.data}></input>);
    }
}

export class PanelItem extends Component {
    render() {
        return (<div className={'panelItem' + (this.props.title ? ' itemTitle' : '')} style={{width: this.props.width}}>{this.props.data}</div>);
    }
}

export class PanelDivider extends Component {
    render() {
        return (<hr className='panelDivider'></hr>);
    }
}

export class PanelPropertyCanvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listenerToken: 'PanelPropCanvas' + Math.random(),
            ctx: null,
            scale: 1,
        };
    }

    componentDidMount() {
        let ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.scale(this.props.width / 10, this.props.width / 10);
        this.setState({ ctx, scale: this.props.width });
        this.setCanvas(SDM.getPropertyImage(this.props.x, this.props.y));
        ctr.listenForEvent(EVENTS.PropertyColorUpdate, this.state.listenerToken, (data) => {
            let xy = {x: 0, y: 0};
            if (data.args.x == null || data.args.y == null)
                xy = ctr.fromID(Func.BigNumberToNumber(data.args.property));
            else {
                xy.x = data.args.x;
                xy.y = data.args.y;
            }
            console.info('DRAWING: ', xy, this.props)
            if (xy.x !== this.props.x || xy.y !== this.props.y)
                return;

            if (data.args.colorsRGB == null)
                this.setCanvas(Func.ContractDataToRGBAArray(data.args.colors));
            else
                this.setCanvas(data.args.colorsRGB);
        });
    }

    componentWillReceiveProps(newProps) {
        if (newProps.x != this.props.x || newProps.y != this.props.y)
            this.setCanvas(SDM.getPropertyImage(newProps.x, newProps.y));
    }

    componentWillUnmount() {
        ctr.stopListeningForEvent(EVENTS.PropertyColorUpdate, this.state.listenerToken);
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
        ctx.drawImage(this.canvas, 0, 0);
    }

    render() {
        return (
            <div className='panelCanvasDiv'>
                <canvas 
                    className='panelCanvas'
                    width={this.props.width} 
                    height={this.props.width}
                    ref={(canvas) => { this.canvas = canvas; }} 
                ></canvas>
            </div>
        );
    }
}