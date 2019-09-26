// @flow

import React from 'react'
import {View, Modal as RNModal, TouchableOpacity, Image} from 'react-native'
import {NavigationEvents} from 'react-navigation'

import styles from './styles/Modal.style'
import closeIcon from '../../assets/img/close.png'

import type {Node} from 'react'

type Props = {
  onRequestClose: () => any,
  visible: boolean,
  children: Node,
  showCloseIcon?: boolean,
  noPadding?: boolean,
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
    const {
      visible,
      showCloseIcon,
      onRequestClose,
      noPadding,
      children,
    } = this.props
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
            <View style={[styles.container, noPadding === true && styles.noPadding]}>
              {showCloseIcon === true && (
                <TouchableOpacity style={styles.close} onPress={onRequestClose}>
                  <Image source={closeIcon} />
                </TouchableOpacity>
              )}
              <View style={[styles.content, noPadding === true && styles.noPadding]}>
                {children}
              </View>
            </View>
          </View>
        </RNModal>
      </>
    )
  }
}

export default Modal
