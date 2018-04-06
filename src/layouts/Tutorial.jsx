import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../contract/contract.jsx';
import {Modal, Button, Header, ModalContent, ModalActions, Icon} from 'semantic-ui-react';
import * as Strings from '../const/strings';
import {GFD, GlobalState, TUTORIAL_STATE} from '../functions/GlobalState';
import Info from './ui/Info';

class Tutorial extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tutorialState: TUTORIAL_STATE.NONE,
        };
    }

    componentDidMount() {
        GFD.listen('tutorialStateIndex', 'tutorial', (newID) => {
            console.info('New Tutorial state: ', newID);
            this.setState({tutorialState: TUTORIAL_STATE[Object.keys(TUTORIAL_STATE)[newID]]})
        });
    }



    render() {
        return (
            <div className='tutorialContainer'>
                <Modal id='tutorialDimmer' className='tutorialDimmer' open={this.state.tutorialState.index != 0} basic size='small'>
                    <Header icon='help circle' content='Tutorial' />
                    <ModalContent>
                        {Strings.TUTORIAL[this.state.tutorialState.index].map((str, i) => (
                            <p key={i}>{str}</p>
                        ))}
                    </ModalContent>
                    <ModalActions>
                        <Button basic inverted>
                        <Icon name='remove' /> Back
                        </Button>
                        <Button color='green' inverted>
                        <Icon name='checkmark' /> Next
                        </Button>
                    </ModalActions>
                </Modal>
            </div>
        );
    }
}

export default Tutorial