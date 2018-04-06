import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../contract/contract.jsx';
import {Message} from 'semantic-ui-react';

export const TUTORIAL_STATE = {
    NONE: {
        index: 0,
        className: 'tutorial0'
    },
    CANVAS: {
        index: 1,
        className: 'tutorial1'
    },
    DESCBOXDETAILS: {
        index: 2,
        className: 'tutorial2'
    },
    DESCBOXACTIONS: {
        index: 3,
        className: 'tutorial3'
    },
    UPDATEFORM: {
        index: 4,
        className: 'tutorial4'
    },
    BUYFORM: {
        index: 5,
        className: 'tutorial5'
    },
    DONEMETAMASK: {
        index: 6,
        className: 'tutorial6'
    },
    DONENOTMETAMASK: {
        index: 7,
        className: 'tutorial7'
    }
};

class Tutorial extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tutorialState: TUTORIAL_STATE.NONE,
        };
    }

    goToNextState() {
        let newState = TUTORIAL_STATE.NONE;
        switch(this.state.tutorialState.index) {
            case TUTORIAL_STATE.NONE.index:
                newState = TUTORIAL_STATE.CANVAS;
                break;
            case TUTORIAL_STATE.CANVAS.index:
                newState = TUTORIAL_STATE.DESCBOXDETAILS;
                break;
            case TUTORIAL_STATE.DESCBOXDETAILS.index:
                newState = TUTORIAL_STATE.DESCBOXACTIONS;
                break;
            case TUTORIAL_STATE.DESCBOXACTIONS.index:
                newState = TUTORIAL_STATE.UPDATEFORM;
                break;
            case TUTORIAL_STATE.UPDATEFORM.index:
                newState = TUTORIAL_STATE.BUYFORM;
                break;
            case TUTORIAL_STATE.BUYFORM.index:
                newState = TUTORIAL_STATE.DONEMETAMASK;
                newState = TUTORIAL_STATE.DONENOTMETAMASK;
                break;
            case TUTORIAL_STATE.DONEMETAMASK.index:
            case TUTORIAL_STATE.DONENOTMETAMASK.index:
                newState = TUTORIAL_STATE.NONE;
                break;
        }
        this.setState({tutorialState: newState});
    }

    render() {
        return (
            <div></div>
        );
    }
}

export default Tutorial