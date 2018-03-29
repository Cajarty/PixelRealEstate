import React, { Component } from 'react'
import BuyPixelForm from '../forms/BuyPixelForm.jsx';
import SetPixelColorForm from '../forms/SetPixelColorForm';
import SellPixelForm from '../forms/SellPixelForm';
import Pullout from '../ui/Pullout';
import PulloutTab from '../ui/PulloutTab';
import * as Assets from '../../const/assets.jsx';
import SetHoverText from '../forms/SetHoverText';
import SetLink from '../forms/SetLink';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as EVENTS from '../../const/events';
import {Contract, ctr} from '../../contract/contract';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';

class HoverLabel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            labelText: '',
            hoverX: -1,
            hoverY: -1,
            labelX: -1,
            labelY: -1,
            canvasWidth: 0,
            canvasHeight: 0,
            offsetX: 0,
            offsetY: 0,
        }
    }

    componentDidMount() {
        GFD.listen('hoverX', 'hoverLabel', (x) => {
            let hoverX = Math.floor(x / 10);
            if (hoverX != this.state.hoverX)
                this.updateLabel(hoverX, this.state.hoverY);
            this.setState({
                hoverX: hoverX,
                labelX: this.state.offsetX + (x * (this.state.canvasWidth / 1000)) + 10
            });
        })
        GFD.listen('hoverY', 'hoverLabel', (y) => {
            let hoverY = Math.floor(y / 10);
            if (hoverY != this.state.hoverY)
                this.updateLabel(this.state.hoverX, hoverY);
            this.setState({
                hoverY: hoverY,
                labelY: this.state.offsetY + (y * (this.state.canvasHeight / 1000)) + 10
            });
        })
        GFD.listen('canvasTopOffset', 'hoverLabel', (top) => {
            this.setState({
                offsetY: top
            });
        })
        GFD.listen('canvasLeftOffset', 'hoverLabel', (left) => {
            this.setState({
                offsetX: left
            });
        })
        GFD.listen('canvasWidth', 'hoverLabel', (width) => {
            this.setState({
                canvasWidth: width
            });
        })
        GFD.listen('canvasHeight', 'hoverLabel', (height) => {
            this.setState({
                canvasHeight: height
            });
        })
    }

    updateLabel(x, y) {
        if (x < 0 || y < 0) {
            this.setState({show: false})
        } else {
            if (SDM.isPropertyLoaded(x, y))
            ctr.getHoverText(SDM.getPropertyData(x, y).owner, (data) => {
                if (data != null && data.length > 0)
                    this.setState({show: true, labelText: data});
                else
                    this.setState({show: false});
            })
        }
    }

    render() {
        return (
            <div 
                className={'hoverLabel ' + (this.state.show ? '' : 'hidden')}
                style={{
                    left: this.state.labelX,
                    top: this.state.labelY,
                }}
                >
                {this.state.labelText}
            </div>
        );
    }
}

export default HoverLabel