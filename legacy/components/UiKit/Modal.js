// @flow

/**
 * IMPORTANT:
 * Modals may have unexpected behaviours, particularly on iOS.
 * A few recommandations when using them:
 * - iOS: make sure you test in a *release* build and on a real device
 * - avoid chaining modals (ie. creating a dialog in which one modal is shown
 * after the other)
 * - when visibility is controled through a component state variable, remember
 * that setState() is a *request* to change the state. The actual change may
 * occur within several UI ticks and not immediately.
 * - avoid mixing modals with Alert.alert() as this may freeze the UI
 * on iOS. See https://github.com/facebook/react-native/issues/10471
 */
import {useNavigation} from '@react-navigation/native'
import type {Node} from 'react'
import React from 'react'
import {Image, Modal as RNModal, TouchableOpacity, View} from 'react-native'

import closeIcon from '../../assets/img/close.png'
import styles from './styles/Modal.style'

type Props = {
  onRequestClose: () => any,
  visible: boolean,
  children: Node,
  showCloseIcon?: boolean,
  noPadding?: boolean,
  navigation: any,
}

type State = {
  isFocused: boolean,
}

// Note(ppershing): we need to hide the modal when navigating
// from this screen as modals are shown over react-navigation
// Warning: This means that children components are unmounted
// while on different screen and therefore should not keep any
// important state!
// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
class Modal extends React.Component<Props, State> {
  state = {
    isFocused: true,
  }

  _subscriptions: Array<() => mixed> = []

  componentDidMount = () => {
    const {navigation} = this.props
    this._subscriptions.push(navigation.addListener('focus', () => this.handleWillFocus()))
    this._subscriptions.push(navigation.addListener('blur', () => this.handleWillBlur()))
  }

  componentWillUnmount = () => {
    this._subscriptions.forEach((unsubscribeFn) => unsubscribeFn())
  }

  handleWillBlur = () => this.setState({isFocused: false})
  handleWillFocus = () => this.setState({isFocused: true})

  render() {
    const {visible, showCloseIcon, onRequestClose, noPadding, children} = this.props
    const {isFocused} = this.state

    return (
      <RNModal transparent animationType="fade" visible={visible && isFocused} onRequestClose={onRequestClose}>
        <View style={styles.backdrop}>
          <View style={[styles.container, noPadding === true && styles.noPadding]}>
            <View style={[styles.content, noPadding === true && styles.noPadding]}>{children}</View>
            {showCloseIcon === true && (
              <TouchableOpacity style={styles.close} onPress={onRequestClose}>
                <Image source={closeIcon} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </RNModal>
    )
  }
}

export default (props: $Diff<Props, {navigation: any}>) => {
  const navigation = useNavigation()
  return <Modal {...props} navigation={navigation} />
}
