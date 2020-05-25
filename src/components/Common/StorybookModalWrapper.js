// @flow
import React from 'react'

import type {ComponentType} from 'react'

// all modals should implement these props
type ModalProps = {
  onRequestClose: () => any,
  visible: boolean,
}

type State = {
  showModal: boolean,
}
const StorybookModalWrapper = (WrappedModal: ComponentType<ModalProps>) =>
  class extends React.Component<*, State> {
    state = {
      showModal: true,
    }

    closeModal = () => this.setState({showModal: false})

    render() {
      return (
        <WrappedModal
          visible={this.state.showModal}
          onRequestClose={this.closeModal}
          {...this.props}
        />
      )
    }
  }

export default StorybookModalWrapper
