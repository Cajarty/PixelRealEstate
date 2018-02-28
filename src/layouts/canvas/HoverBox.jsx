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

class HoverLabel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            hoverX: -1,
            hoverY: -1,
            canvasWidth: 0,
            canvasHeight: 0,
            offsetX: 0,
            offsetY: 0,
        }
    }

    componentDidMount() {
        GFD.listen('hoverX', 'hoverLabel', (hoverX) => {
            this.setState({
                hoverX: hoverX,
            });
        })
        GFD.listen('hoverY', 'hoverLabel', (hoverY) => {
            this.setState({
                hoverY: hoverY,
            });
            this.updateLabel(GFD.getData('hoverX'), hoverY);
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
        //get hover text by property x,y here. also make sure to check its not te same property its requesting on a 1 pixel mouse move or something
        if (x < 0 || y < 0) {
            this.setState({show: false})
        } else {
            this.setState({show: true});
        }
    }

    render() {
        return (
            <div 
                className={'hoverBox ' + (this.state.show ? '' : 'hidden')}
                style={{
                    left: this.state.offsetX + Math.floor(this.state.hoverX / 10) * (this.state.canvasWidth / 100) + 'px',
                    top: this.state.offsetY + Math.floor(this.state.hoverY / 10) * (this.state.canvasHeight / 100) + 'px',
                    minWidth: (this.state.canvasWidth / 100) + 'px',
                    minHeight: (this.state.canvasHeight / 100) + 'px'
                }}
                >
            </div>
        );
    }
}

export default HoverLabel