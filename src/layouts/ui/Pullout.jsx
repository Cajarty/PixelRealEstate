import React, { Component } from 'react'

import './ui.scss'

class Pullout extends Component {
    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(newProps) {

    }

    render() {
        return (
            <div className='pullout' style={{ top: this.props.top + '%', zIndex: this.props.top }}>
                <div className='tab'>

                </div>
                <div className='panel'>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default Pullout