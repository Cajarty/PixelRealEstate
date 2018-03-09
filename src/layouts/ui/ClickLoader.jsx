import React, { Component } from 'react'
import Loader from './Loader';
import {GFD, GlobalState} from '../../functions/GlobalState';

export default class ClickLoader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            hoverX: -1,
            hoverY: -1,
            labelX: -1,
            labelY: -1,
            canvasWidth: 0,
            canvasHeight: 0,
            offsetX: 0,
            offsetY: 0,
            waitTime: 2000,
        }
    }

    componentDidMount() {
        GFD.listen('hoverX', 'clickLoader', (x) => {
            let hoverX = Math.floor(x / 10);
            if (hoverX != this.state.hoverX)
                this.updateLoaderPosition(hoverX, this.state.hoverY);
            this.setState({
                hoverX: hoverX,
                labelX: this.state.offsetX + (x * (this.state.canvasWidth / 1000)) - 8
            });
        })
        GFD.listen('hoverY', 'clickLoader', (y) => {
            let hoverY = Math.floor(y / 10);
            if (hoverY != this.state.hoverY)
                this.updateLoaderPosition(this.state.hoverX, hoverY);
            this.setState({
                hoverY: hoverY,
                labelY: this.state.offsetY + (y * (this.state.canvasHeight / 1000)) + 20
            });
        })
        GFD.listen('canvasTopOffset', 'clickLoader', (top) => {
            this.setState({
                offsetY: top
            });
        })
        GFD.listen('canvasLeftOffset', 'clickLoader', (left) => {
            this.setState({
                offsetX: left
            });
        })
        GFD.listen('canvasWidth', 'clickLoader', (width) => {
            this.setState({
                canvasWidth: width
            });
        })
        GFD.listen('canvasHeight', 'clickLoader', (height) => {
            this.setState({
                canvasHeight: height
            });
        })
        GFD.listen('pressTime', 'clickLoader', (time) => {
            if (time == -1) {
                this.updateLoaderPosition(-1, -1);
                clearTimeout(this.state.clickTimeout);
                return;
            }
            let now = new Date().getTime();
            let difference = now - time;
            if (difference >= this.state.waitTime) {
                this.performClick(GFD.getData('pressX'), GFD.getData('pressY'));
            } else {
                this.setState({
                    clickTimeout: setTimeout(() => {
                        if (GFD.getData('pressTime') == -1)
                            return;
                        this.performClick(GFD.getData('pressX'), GFD.getData('pressY'));
                    }, Math.max(this.state.waitTime - difference, 5)),
                });
            }
        })
    }

    performClick(x, y) {
        //add actions here.
    }

    updateLoaderPosition(x, y) {
        if (x < 0 || y < 0) {
            this.setState({show: false})
        } else {
            this.setState({show: true});
        }
    }

    render() {
        return (

            <div 
                className={'clickLoader ' + (this.state.show ? '' : 'hidden')}
                style={{
                    left: this.state.labelX,
                    top: this.state.labelY,
                }}
                >
                <Loader className='clickLoaderLoader' progress={100} maxWidth={24}/>
            </div>
        );
    }
}