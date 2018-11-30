// @flow

import React from 'react'
import {connect} from 'react-redux'
import {Modal, BackHandler, Text, ActivityIndicator} from 'react-native'

import {updateHistory} from '../../actions/history'
import walletManager from '../../crypto/wallet'
import {WALLET_ROUTES, SEND_ROUTES} from '../../RoutesList'
import {NetworkError} from '../../api/errors'
import {showErrorDialog, DIALOG_BUTTONS} from '../../actions'
import assert from '../../utils/assert'

import type {ComponentType} from 'react'

const getTranslations = (state) => state.trans.WaitSendTransactionModal

class SendingModal extends React.Component<*> {
  componentDidMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBackButtonPressAndroid,
    )

    this.submitTransaction()
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.onBackButtonPressAndroid,
    )
  }

  async submitTransaction() {
    const {navigation, updateHistory} = this.props

    const decryptedKey = navigation.getParam('decryptedKey')
    const transactionData = navigation.getParam('transactionData')
    try {
      const signedTx = await walletManager.signTx(transactionData, decryptedKey)
      await walletManager.submitTransaction(signedTx)
      updateHistory()

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

export default connect(
  (state) => ({
    translations: getTranslations(state),
  }),
  {
    updateHistory,
  },
)((SendingModal: ComponentType<{}>))
