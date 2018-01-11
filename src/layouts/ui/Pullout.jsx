import React, { Component } from 'react'

import './ui.css'

class Pullout extends Component {
    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(newProps) {

    }

    render() {
        return (
            <div className={'pullout ' + this.props.side}>
                <div>

                </div>
            </div>
        );
    }
}

export default Pullout