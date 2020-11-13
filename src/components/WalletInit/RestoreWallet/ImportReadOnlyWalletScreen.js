/* eslint-disable react-native/no-inline-styles */
// @flow
import React from 'react'
import {compose} from 'redux'
import {View, ScrollView, Dimensions} from 'react-native'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages, type intlShape} from 'react-intl'
import QRCodeScanner from 'react-native-qrcode-scanner'
import {Bip32PublicKey} from 'react-native-haskell-shelley'

import {Text, BulletPointItem} from '../../UiKit'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle} from '../../../utils/renderUtils'
import {Logger} from '../../../utils/logging'
import {errorMessages} from '../../../i18n/global-messages'
import {showErrorDialog} from '../../../actions'

import styles from './styles/ImportReadOnlyWalletScreen.style'

import type {ComponentType} from 'react'
import type {Navigation} from '../../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.importreadonlywalletscreen.title',
    defaultMessage: '!!!Read-only Wallet',
  },
  paragraph: {
    id: 'components.walletinit.importreadonlywalletscreen.paragraph',
    defaultMessage:
      '!!!To import a read-only wallet from the Yoroi ' +
      'extension, you will need to:',
  },
  line1: {
    id: 'components.walletinit.importreadonlywalletscreen.line1',
    defaultMessage: '!!!Open "My wallets" page in the Yoroi extension.',
  },
  line2: {
    id: 'components.walletinit.importreadonlywalletscreen.line2',
    defaultMessage:
      '!!!Click on the QR code icon of the wallet you want to ' +
      'import in the mobile app.',
  },
})

let scannerRef // reference to QR code sanner to re-activate if required

// TODO(v-almonacid): move these validators somewhere else

const isString = (s) => typeof s === 'string' || s instanceof String

const isValidPath = (path: Array<any>) => {
  for (const i of path) {
    if (!(Number.isInteger(i) && i >= 0)) {
      return false
    }
  }
  return true
}

const canParsePublicKey = async (publicKeyHex: string): Promise<boolean> => {
  try {
    await Bip32PublicKey.from_bytes(Buffer.from(publicKeyHex, 'hex'))
    return true
  } catch (_e) {
    return false
  }
}

const handleOnRead = async (
  event: Object,
  navigation: Navigation,
  intl: intlShape,
): Promise<void> => {
  try {
    Logger.debug('ImportReadOnlyWalletScreen::handleOnRead::data', event.data)
    const dataObj = JSON.parse(event.data)
    const {publicKeyHex, path} = dataObj
    if (
      publicKeyHex != null &&
      isString(publicKeyHex) &&
      (await canParsePublicKey(publicKeyHex)) &&
      path != null &&
      Array.isArray(path) &&
      isValidPath(path)
    ) {
      Logger.debug('ImportReadOnlyWalletScreen::publicKeyHex', publicKeyHex)
      Logger.debug('ImportReadOnlyWalletScreen::path', path)
      navigation.navigate(WALLET_INIT_ROUTES.SAVE_READ_ONLY_WALLET, {
        publicKeyHex,
        path,
      })
    } else {
      throw new Error('invalid QR code')
    }
  } catch (e) {
    Logger.debug('ImportReadOnlyWalletScreen::handleOnRead::error', e)
    await showErrorDialog(errorMessages.invalidQRCode, intl)
    // re-enable QR code scanning
    if (scannerRef && scannerRef.reactivate != null) scannerRef.reactivate()
  }
}

const getInstructions = (formatMessage) => [
  formatMessage(messages.line1),
  formatMessage(messages.line2),
]

const getContent = (formatMessage) => (
  <ScrollView style={styles.bottomView}>
    <Text style={styles.paragraph}>{formatMessage(messages.paragraph)}</Text>
    {getInstructions(formatMessage).map((row, i) => (
      <BulletPointItem textRow={row} key={i} style={styles.paragraph} />
    ))}
  </ScrollView>
)

const ImportReadOnlyWalletScreen = ({intl, onRead}) => (
  <View style={styles.container}>
    <View style={styles.cameraContainer}>
      <QRCodeScanner
        onRead={onRead}
        cameraProps={{
          ratio: '1:1',
          width: Dimensions.get('screen').width,
        }}
        ref={(node) => {
          scannerRef = node
        }}
        cameraStyle={{overflow: 'hidden'}}
      />
    </View>
    <View style={styles.bottomView}>{getContent(intl.formatMessage)}</View>
  </View>
)

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      onRead: ({navigation, intl}) => async (event) => {
        await handleOnRead(event, navigation, intl)
      },
    }),
  )(ImportReadOnlyWalletScreen): ComponentType<{
    navigation: Navigation,
    intl: intlShape,
    route: any,
  }>),
)
