import React, { Component } from 'react'
import {Panel, PanelItem} from './Panel';

class PanelContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataView: []
        }
    }

    componentDidMount() {
        let start = this.props.viewStart | 0;
        let end = this.props.viewEnd | this.props.data.length;
        this.setState({dataView: this.props.data.slice(start, end)});
    }

    componentWillReceiveProps(newProps) {
        let start = newProps.viewStart == null ? 0 : newProps.viewStart;
        let end = newProps.viewEnd == null ? this.props.data.length : newProps.viewEnd;
        this.setState({dataView: newProps.data.slice(start, end)});
    }

    render() {
        return (
            <div className='panelContainer'>
                {this.state.dataView.map((child, i) => (
                    <Panel key={i}>
                        <PanelItem width='10%' data='X:'/>
                        <PanelItem width='40%' data={child.x}/>
                        <PanelItem width='10%' data='Y:'/>
                        <PanelItem width='40%' data={child.y}/>
                    </Panel>
                ))}
            </div>
        );
    }
}
export default PanelContainer