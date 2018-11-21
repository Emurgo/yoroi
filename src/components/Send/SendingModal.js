// @flow

import React from 'react'
import {compose} from 'redux'
import {Alert, Modal, BackHandler, Text, ActivityIndicator} from 'react-native'

import {withTranslations} from '../../utils/renderUtils'
import walletManager from '../../crypto/wallet'
import {WALLET_ROUTES, SEND_ROUTES} from '../../RoutesList'
import {NetworkError, ApiError} from '../../api/errors'

import type {ComponentType} from 'react'

const getTranslations = (state) => state.trans.Send.SubmitModal

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
      const config = {
        network: {
          title: 'l10n Network error',
          text:
            'Error connecting to the server. ' +
            'Please check your internet connection',
          target: SEND_ROUTES.CONFIRM,
        },
        api: {
          title: 'l10n Backend error',
          text: 'l10n Backend could not process this transaction',
          target: SEND_ROUTES.MAIN,
        },
        default: {
          title: 'l10n Unknown error',
          text: 'l10n Unknown error',
          target: SEND_ROUTES.MAIN,
        },
      }

      let data
      if (e instanceof NetworkError) {
        data = config.network
      } else if (e instanceof ApiError) {
        data = config.api
      } else {
        data = config.default
      }
      // TODO(ppershing): error processing + localization
      Alert.alert(data.title, data.text, [
        {
          text: 'l10n ok',
          onPress: () => navigation.navigate(data.target),
        },
      ])
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
