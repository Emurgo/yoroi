// @flow
import React from 'react'

import type {ComponentType} from 'react'

// all modals should implement these props
type ModalProps = {|
  onRequestClose: () => any,
  visible: boolean,
|}

type State = {
  showModal: boolean,
}

const StorybookModalWrapper = <Props: {}>(
  WrappedModal: ComponentType<{...$Exact<Props>, ...ModalProps}>,
): ComponentType<{|...$Exact<Props>, ...ModalProps|}> =>
  class extends React.Component<{|...$Exact<Props>, ...ModalProps|}, State> {
    state = {
      showModal: true,
    }

    closeModal: (void) => void = () => this.setState({showModal: false})

    render() {
      return <WrappedModal visible={this.state.showModal} onRequestClose={this.closeModal} {...this.props} />
    }
  }

export default StorybookModalWrapper
