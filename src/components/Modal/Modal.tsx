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
import {NavigationProp, useNavigation} from '@react-navigation/native'
import React from 'react'
import {Image, Modal as RNModal, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import closeIcon from '../../assets//img/close.png'
import {COLORS} from '../../theme'

type Props = {
  onRequestClose: () => void
  visible: boolean
  children: React.ReactNode
  showCloseIcon?: boolean
  noPadding?: boolean
  title?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}

type NavigationHookProp = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: NavigationProp<any, any, any, any, any>
}

type State = {
  isFocused: boolean
}

// Note(ppershing): we need to hide the modal when navigating
// from this screen as modals are shown over react-navigation
// Warning: This means that children components are unmounted
// while on different screen and therefore should not keep any
// important state!
// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
class ModalClassComponent extends React.Component<Props & NavigationHookProp, State> {
  state = {
    isFocused: true,
  }

  _subscriptions: Array<() => void> = []

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
    const {visible, showCloseIcon, onRequestClose, noPadding, children, title} = this.props
    const {isFocused} = this.state

    return (
      <RNModal transparent animationType="fade" visible={visible && isFocused} onRequestClose={onRequestClose}>
        <View style={styles.backdrop}>
          <View style={[styles.container, noPadding && styles.noPadding, !!title && styles.withTitle]}>
            {title && <Text style={styles.title}>{title}</Text>}
            {showCloseIcon && (
              <TouchableOpacity style={styles.close} onPress={onRequestClose}>
                <Image source={closeIcon} />
              </TouchableOpacity>
            )}
            <View style={[styles.content, noPadding === true && styles.noPadding]}>{children}</View>
          </View>
        </View>
      </RNModal>
    )
  }
}

export const Modal = (props: Props) => {
  const navigation = useNavigation()
  return <ModalClassComponent {...props} navigation={navigation} />
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(74,74,74,.9)',
  },
  noPadding: {
    padding: 0,
    marginTop: 0,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 24,
  },
  close: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 16,
  },
  content: {
    marginTop: 15,
  },
  withTitle: {
    paddingTop: 0,
    marginTop: 0,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Rubik-Medium',
    lineHeight: 30,
    color: COLORS.MODAL_HEADING,
    alignSelf: 'center',
    paddingTop: 8,
  },
})
