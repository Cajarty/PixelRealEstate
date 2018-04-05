import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import Info from '../ui/Info';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as Strings from '../../const/strings';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import {Segment, ModalContent, ModalHeader, Divider, Modal, Grid, Label, Input, Container, Icon, Button, Popup, ModalActions, Message} from 'semantic-ui-react';

const TOKENS_TO_MINUTES = 1;

class MakePrivateForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
            isPrivate: false,
            becomePublic: 0, //a timestamp of when goes public
            becomePublicYet: false, //has public timestamp run out?
            minutesPrivate: 0,
            tokenCost: 0,
        };
    }

    componentWillReceiveProps(newProps) {
        let update = {};
        Object.keys(newProps).map((i) => {
            if (newProps[i] != this.props[i]) {
                update[i] = newProps[i];
            }
        });
        this.setState(update);
    }

    componentDidMount() {
        GFD.listen('x', 'ChangePropertyMode', (x) => {
            this.setState({x});
        })
        //restructure
        GFD.listen('y', 'ChangePropertyMode', (y) => {
            this.setState({
                y,
                isPrivate: SDM.getPropertyData(GFD.getData('x') - 1, y - 1).isPrivate,
                becomePublic: SDM.getPropertyData(GFD.getData('x') - 1, y - 1).becomePublic 
            });
            ctr.getPropertyData(GFD.getData('x') - 1, y - 1, (data) => {
                let isPrivate = data[4];
                let becomePublic = Func.BigNumberToNumber(data[5]);
                let becomePublicYet = (becomePublic * 1000 > new Date().getTime());
                this.setState({
                    isPrivate, becomePublic, becomePublicYet
                });
            });
        })
    }

    componentWillUnmount() {
        GFD.closeAll('ChangePropertyMode');
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
    }

    setPropertyMode() {
        let x = GFD.getData('x') - 1;
        let y = GFD.getData('y') - 1;
        if (SDM.getPropertyData(x, y).isPrivate) {
            ctr.sendResults(LISTENERS.Alert, {result: false, message: "Property is already in private mode."});
            return;
        }
        if (SDM.getPropertyData(x, y).becomePublic * 1000 > new Date().getTime()) {
            ctr.sendResults(LISTENERS.Alert, {result: false, message: "Property is temorarily reserved by a user."});
            return;
        }
        ctr.setPropertyMode(x, y, true, this.state.minutesPrivate, () => {
            console.info("Mode toggled, confirmed through a transaction");
        })
    }


    changeTokens(t) {
        this.setState({
            tokenCost: t,
            minutesPrivate: t * TOKENS_TO_MINUTES
        })
    }

    changeTime(t) {
        this.setState({
            tokenCost: t * (1 / TOKENS_TO_MINUTES),
            minutesPrivate: t
        })
    }

    toggleModal(set = null) {
        let res = set != null ? set : !this.state.isOpen;
        this.setState({isOpen: res});
        this.props.close("SET_PRIVATE");
    }

    render() {
        return (
            <Modal size='tiny'
                open={this.state.isOpen} 
                closeIcon 
                onClose={() => this.toggleModal(false)}
            >
                <ModalHeader>Set Property Private</ModalHeader>
                <ModalContent>
                <Info messages={Strings.FORM_SET_PRIVATE}/>
                <Divider/>
                <div className='twoColumn w50 left'>
                    <Input
                        placeholder="1 - 100"
                        type="number"
                        className='oneColumnFull'
                        fluid
                        label={<Popup
                            trigger={<Label className='uniform'>X</Label>}
                            content='X Position'
                            className='Popup'
                            size='tiny'
                        />}
                        value={this.state.x} 
                        onChange={(e) => this.setX(e.target.value)}
                    />
                    </div>
                    <div className='twoColumn w50 right'>
                    <Input
                        placeholder="1 - 100"
                        type="number"
                        label={<Popup
                            trigger={<Label className='uniform'>Y</Label>}
                            content='Y Position'
                            className='Popup'
                            size='tiny'
                        />}
                        className='oneColumnFull'
                        fluid
                        value={this.state.y} 
                        onChange={(e) => this.setY(e.target.value)}
                    />
                </div>
                <Divider horizontal>Duration</Divider>

                <Grid columns={3}>
                    <Grid.Row>
                        <Grid.Column width={7}>
                        <Input 
                            fluid labelPosition='right' 
                            label='PXL' placeholder='0' 
                            onChange={(e) => this.changeTokens(e.target.value)}
                            value={this.state.tokenCost}
                            />
                        </Grid.Column>
                        <Grid.Column width={2}>
                        <Container textAlign='center' fluid style={{lineHeight: '250%'}}>
                        <Icon name='exchange'/>
                        </Container>
                        </Grid.Column>
                        <Grid.Column width={7}>
                        <Input 
                            fluid label='Minutes' 
                            placeholder='0' 
                            onChange={(e) => this.changeTime(e.target.value)} 
                            value={this.state.minutesPrivate}
                        />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                {this.state.isPrivate || this.state.becomePublic != 0 ?
                    <div>
                        <Divider/>
                        {this.state.isPrivate || this.state.becomePublicYet ? 
                        <Segment inverted color='red' secondary>            
                            <div>{this.state.isPrivate ? "This Property is already in private mode." : ""}</div>
                            <div>{this.state.becomePublicYet ? "This Property is temporarily reserved by a user." : ""}</div>
                        </Segment>
                        : null}
                    </div>
                    :
                    null
                }
            </ModalContent>
            <ModalActions>
                <Button primary disabled={this.state.isPrivate || this.state.becomePublicYet} onClick={() => this.setPropertyMode()}>Set Private</Button>
            </ModalActions>
            </Modal>
        );
    }
}

export default MakePrivateForm