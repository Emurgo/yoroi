// @flow

import React from 'react'
import {StyleSheet, View, Modal as RNModal} from 'react-native'
import {NavigationEvents} from 'react-navigation'

import type {Node} from 'react'

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(74,74,74,.9)',
  },
})

type Props = {
  onRequestClose: () => any,
  visible: boolean,
  children: Node,
}

type State = {
  isFocused: boolean,
}

// Note(ppershing): we need to hide the modal when navigating
// from this screen as modals are shown over react-navigation
// Warning: This means that children components are unmounted
// while on different screen and therefore should not keep any
// important state!
class Modal extends React.Component<Props, State> {
  state = {
    isFocused: true,
  }

  handleWillBlur = () => {
    this.setState({isFocused: false})
  }

  handleWillFocus = () => {
    this.setState({isFocused: true})
  }

  render() {
    const {visible, onRequestClose, children} = this.props
    const {isFocused} = this.state
    return (
      <>
        <NavigationEvents
          onWillBlur={this.handleWillBlur}
          onWillFocus={this.handleWillFocus}
        />
        <RNModal
          transparent
          animationType="fade"
          visible={visible && isFocused}
          onRequestClose={onRequestClose}
        >
          <View style={styles.backdrop}>{children}</View>
        </RNModal>
      </>
    )
  }
}

export default Modal
