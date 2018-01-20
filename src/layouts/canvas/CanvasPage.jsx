import React, { Component } from 'react'
import Canvas from './Canvas.jsx'
import ManagePanel from './ManagePanel.jsx'
import ActionPanel from './ActionPanel.jsx'
import {Contract, ctr} from '../../contract/contract.jsx';
import PropertySalesLog from '../ui/PropertySalesLog';
import ErrorBox from '../ErrorBox';
import ZoomCanvas from './ZoomCanvas';
import Axios from '../../network/Axios.jsx';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';

class CanvasPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverX: -1,
            hoverY: -1,
            clickX: '',
            clickY: '',
            pixelDataUpdateVersion: 0,
            pixelData: null,
        }
    }

    componentDidMount() {
        this.loadCanvas();
        SDM.requestServerData();
    }
    

    loadCanvas() {
        let cancelToken = null;
        Axios.getInstance().get('/getPixelData', cancelToken).then((result) => {
            this.setState({
                pixelData: result.data,
                pixelDataUpdateVersion: this.state.pixelDataUpdateVersion + 1
            });
        });
        this.setState({cancelToken: cancelToken});
    }

    canvasHover(x, y) {
        this.setState({
            hoverX: x, 
            hoverY: y
        });
    }

    canvasClick(x, y) {
        this.setState({
            clickX: x, 
            clickY: y
        });
    }

    render() {
        return (
            <div>
                <div className='top'>
                        <ManagePanel
                            clickX={this.state.clickX}
                            clickY={this.state.clickY}
                        />
                    <div className='left'>
                        <div>
                            <ZoomCanvas 
                                x={this.state.hoverX} 
                                y={this.state.hoverY}
                                pixelData={this.state.pixelData} 
                                pixelDataUpdateVersion={this.state.pixelDataUpdateVersion} 
                            />
                        </div>
                    </div>
                    <div className='center'>
                        <Canvas 
                            pixelData={this.state.pixelData} 
                            pixelDataUpdateVersion={this.state.pixelDataUpdateVersion} 
                            hover={(x, y) => this.canvasHover(x, y)}
                            click={(x, y) => this.canvasClick(x, y)}
                        />
                    </div>
                    <div className='right'>
                    </div>
                        <ActionPanel
                            clickX={this.state.clickX}
                            clickY={this.state.clickY}
                        />
                </div>
                <div className='middle-top'>
                    <ErrorBox/>
                </div>
                <div className='middle'>
                    <PropertySalesLog/>
                </div>
                <div className='bottom'>
                </div>
            </div>
        );
    }
}

export default CanvasPage