// @flow

import React from 'react'
import {View, Modal as RNModal, TouchableOpacity} from 'react-native'
import {NavigationEvents} from 'react-navigation'

import Text from './Text'

import styles from './styles/Modal.style'

import type {Node} from 'react'

type Props = {
  onRequestClose: () => any,
  visible: boolean,
  children: Node,
  showCloseIcon: boolean,
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

  handleWillBlur = () => this.setState({isFocused: false})
  handleWillFocus = () => this.setState({isFocused: true})

  render() {
    const {visible, showCloseIcon, onRequestClose, children} = this.props
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
          <View style={styles.backdrop}>
            <View style={styles.container}>
              {showCloseIcon && (
                <TouchableOpacity style={styles.close} onPress={onRequestClose}>
                  <Text style={styles.closeText}>{'\u00d7'}</Text>
                </TouchableOpacity>
              )}
              <View style={styles.content}>{children}</View>
            </View>
          </View>
        </RNModal>
      </>
    )
  }
}

export default Modal
