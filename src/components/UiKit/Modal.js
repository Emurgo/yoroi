// @flow

import React from 'react'
import {
  StyleSheet,
  View,
  Modal as RNModal,
  TouchableOpacity,
} from 'react-native'
import {NavigationEvents} from 'react-navigation'

import Text from './Text'

import type {Node} from 'react'

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(74,74,74,.9)',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 24,
  },
  close: {
    position: 'absolute',
    top: 0,
    right: 8,
  },
  closeText: {
    fontSize: 32,
  },
})

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

  handleWillBlur = () => {
    this.setState({isFocused: false})
  }

  handleWillFocus = () => {
    this.setState({isFocused: true})
  }

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
              {children}
            </View>
          </View>
        </RNModal>
      </>
    )
  }
}

export default Modal
