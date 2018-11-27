// @flow

import React from 'react'
import {compose} from 'redux'
import {Modal, BackHandler, Text, ActivityIndicator} from 'react-native'

import {withTranslations} from '../../utils/renderUtils'
import walletManager from '../../crypto/wallet'
import {WALLET_ROUTES, SEND_ROUTES} from '../../RoutesList'
import {NetworkError} from '../../api/errors'
import {showErrorDialog, DIALOG_BUTTONS} from '../../actions'
import assert from '../../utils/assert'

import type {ComponentType} from 'react'

const getTranslations = (state) => state.trans.WaitSendTransactionModal

class SendingModal extends React.Component<*> {
  componentDidMount() {
    const {navigation, translations} = this.props
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBackButtonPressAndroid,
    )

    this.submitTransaction(navigation, translations)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.onBackButtonPressAndroid,
    )
  }

  async submitTransaction(navigation, translations) {
    const decryptedKey = navigation.getParam('decryptedKey')
    const transactionData = navigation.getParam('transactionData')
    try {
      const signedTx = await walletManager.signTx(transactionData, decryptedKey)
      await walletManager.submitTransaction(signedTx)
      navigation.navigate(WALLET_ROUTES.TX_HISTORY)
    } catch (e) {
      if (e instanceof NetworkError) {
        const result = await showErrorDialog((dialogs) => dialogs.networkError)
        assert.assert(
          result === DIALOG_BUTTONS.YES,
          'User should have tapped yes',
        )

        navigation.navigate(SEND_ROUTES.CONFIRM)
      } else {
        const result = await showErrorDialog((dialogs) => dialogs.general)
        assert.assert(
          result === DIALOG_BUTTONS.YES,
          'User should have tapped yes',
        )

        navigation.navigate(SEND_ROUTES.MAIN)
      }
    }
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
