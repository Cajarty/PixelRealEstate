import React, { Component } from 'react'
import {GFD, GlobalState} from '../../functions/GlobalState';
import CircularProgressbar from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';

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
            loaderValue: 0,
            clickTime: 1000,
            startClickTime: 0,
            loadedLink: false,
        }
    }

    componentDidMount() {
        GFD.listen('hoverX', 'clickLoader', (x) => {
            let hoverX = Math.floor(x / 10);
            if (hoverX == this.state.hoverX)
                return;
            this.setState({
                hoverX: hoverX,
                labelX: (hoverX - 1.5) * this.state.canvasWidth / 100
            });
        })
        GFD.listen('hoverY', 'clickLoader', (y) => {
            let hoverY = Math.floor(y / 10);
            if (hoverY == this.state.hoverY)
                return;
            this.setState({
                hoverY: hoverY,
                labelY: (hoverY - 1.5) * this.state.canvasHeight / 100
            });
        })
        GFD.listen('pressX', 'clickLoader', (x) => {
            console.info(x)
            if (this.state.hoverY != -1 && x != this.state.hoverX)
                this.updateLoaderPosition(x, GFD.getData('pressY'));
        })
        GFD.listen('pressY', 'clickLoader', (y) => {
            console.info(y)
            if (this.state.hoverX != -1 && y != this.state.hoverY)
                this.updateLoaderPosition(GFD.getData('pressX'), y);
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
    }

    performClick() {
        this.setState({show: false});
        if (this.state.loadedLink) {
            this.linkTag.click();
            this.linkTag.href = '';
        }
    }

    componentWillUnmount() {
        this.clearClickAttempt();
    }

    clearClickAttempt() {
        if (this.state.clickTimeout != null)
            clearTimeout(this.state.clickTimeout);
        if (this.state.loaderTimeout != null)
            clearTimeout(this.state.loaderTimeout);
        this.setState({startClickTime: 0, show: false, loaderValue: 0, loadedLink: false});
    }

    updateLoaderPosition(x, y) {
        this.clearClickAttempt();

        if (x < 0 || y < 0)
            return;

            console.info(SDM.getPropertyData(x - 1, y - 1));

        if (SDM.isPropertyLoaded(x - 1, y - 1)) {
            ctr.getLink(SDM.getPropertyData(x - 1, y - 1).owner, (data) => {
                if (data != null && data.length > 0) {
                    this.linkTag.href = data;
                    this.setState({loadedLink: true})
                }
            });
        }

        this.setState({
            show: true,
            startClickTime: new Date().getTime(),
            clickTimeout: setTimeout(() => {
                this.performClick();
            }, this.state.clickTime + 100),
            loaderTimeout: setInterval(() => {
                let newVal = ((new Date().getTime() - this.state.startClickTime) / this.state.clickTime) * 100;
                this.setState({
                    loaderValue: newVal,
                })
            }, this.state.clickTime / 20),
        });
    }

    render() {
        return (
            <div 
                className={'clickLoader ' + (this.state.show ? '' : 'hidden')}
                style={{
                    left: this.state.labelX,
                    top: this.state.labelY,
                    width: this.state.canvasWidth / 25 || 1,
                    height: this.state.canvasHeight / 25 || 1,
                }}
                >
                <CircularProgressbar 
                    className='clickLoaderLoader' 
                    percentage={this.state.loaderValue}
                    textForPercentage=''
                />
                <a target='_blank' ref={(linkTag) => {this.linkTag = linkTag}} style={{display: 'hidden'}}></a>
            </div>
        );
    }
}