// @flow

import React from 'react'
import {compose} from 'redux'
import {Modal, BackHandler, Text, ActivityIndicator} from 'react-native'

import {withTranslations} from '../../utils/renderUtils'

import type {ComponentType} from 'react'

const getTranslations = (state) => state.trans.Send.SubmitModal

class SendingModal extends React.Component<*> {
  componentDidMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBackButtonPressAndroid,
    )
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.onBackButtonPressAndroid,
    )
  }

  onBackButtonPressAndroid() {
    return false // disable back button
  }

  render() {
    const {translations} = this.props
    return (
      <Modal visible onRequestClose={() => null}>
        <ActivityIndicator size="large" />
        <Text>{translations.submitting}</Text>
      </Modal>
    )
  }
}

export default (compose(withTranslations(getTranslations))(
  SendingModal,
): ComponentType<{}>)
