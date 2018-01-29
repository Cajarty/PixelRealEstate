import React, { Component } from 'react'
//import test from '../../assets/icons/test.png'; is coorecrt

class PanelContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return (
            <div>
                {this.props.data.map((child, i) => (
                    <Panel 
                        key={i}
                        data={child}
                    />
                ))}
            </div>
        );
    }
}

class Panel extends Component {
    render() {
        return (
            <div className='panel'>
                <PanelItem width='25%' data='X:'/>
                <PanelItem width='25%' data={this.props.data.x}/>
                <PanelItem width='25%' data='Y:'/>
                <PanelItem width='25%' data={this.props.data.y}/>
            </div>
        );
    }
}

class PanelItem extends Component {
    render() {
        return (<div className='panelItem' style={{width: this.props.width}}>{this.props.data}</div>);
    }
}

export default PanelContainer