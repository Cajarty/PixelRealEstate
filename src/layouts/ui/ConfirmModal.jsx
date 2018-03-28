import React, { Component } from 'react'
import {Modal, ModalActions, ModalHeader, ModalContent, Button} from 'semantic-ui-react';

class ConfirmModal extends Component {
    state = { open: false }
  
    open = () => this.setState({ open: true })

    close(res = false) {
        this.props.result(res);
        this.setState({ open: false });
    }
  
    render() {
      const { open } = this.state
  
      return (
        <Modal
          dimmer={false}
          open={open}
          onOpen={this.open}
          onClose={this.close}
          size='tiny'
          trigger={<Button primary>{this.props.activateName}</Button>}
        >
          <ModalHeader>{this.props.title}</ModalHeader>
          <ModalContent>
            <p>{this.props.description}</p>
          </ModalContent>
          <ModalActions>
            <Button negative icon='close' content='No' onClick={this.close} />
            <Button positive icon='check' content='Yes' onClick={this.close} />
          </ModalActions>
        </Modal>
      )
    }
  }

  export default ConfirmModal