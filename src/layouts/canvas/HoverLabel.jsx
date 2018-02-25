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
        GFD.listen('hoverX', 'hoverLabel', (hoverX) => {
            this.setState({
                hoverX: hoverX,
                labelX: this.state.offsetX + (hoverX * (this.state.canvasWidth / 1000)) + 10
            });
        })
        GFD.listen('hoverY', 'hoverLabel', (hoverY) => {
            this.setState({
                hoverY: hoverY,
                labelY: this.state.offsetY + (hoverY * (this.state.canvasHeight / 1000)) + 10
            });
            this.updateLabel(this.state.hoverX, hoverY);
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
            this.setState({show: true, labelText: 'Test Text - Please Replace'});
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