/* eslint-disable react-native/no-inline-styles */
// @flow
import React from 'react'
import {compose} from 'redux'
import {View, ScrollView, Dimensions} from 'react-native'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import QRCodeScanner from 'react-native-qrcode-scanner'
import DeviceInfo from 'react-native-device-info'

import {Text, BulletPointItem} from '../../UiKit'
import {CONFIG} from '../../../config/config'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle, onDidMount} from '../../../utils/renderUtils'
import {Logger} from '../../../utils/logging'
import {errorMessages} from '../../../i18n/global-messages'
import {showErrorDialog} from '../../../actions'
import {
  isValidPublicKey,
  isCIP1852AccountPath,
} from '../../../utils/bip44Validators'

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
      '!!!Look for the {buttonType} for the wallet you want to ' +
      'import in the mobile app.',
  },
  buttonType: {
    id: 'components.walletinit.importreadonlywalletscreen.buttonType',
    defaultMessage: '!!!export read-only wallet button',
  },
})

let scannerRef // reference to QR code sanner to re-activate if required
let firstFocus = true

const handleOnRead = async (
  event: Object,
  navigation: Navigation,
  route: Object,
  intl: IntlShape,
): Promise<void> => {
  try {
    Logger.debug('ImportReadOnlyWalletScreen::handleOnRead::data', event.data)
    const dataObj = JSON.parse(event.data)
    const {publicKeyHex, path} = dataObj
    if (isCIP1852AccountPath(path) && (await isValidPublicKey(publicKeyHex))) {
      Logger.debug('ImportReadOnlyWalletScreen::publicKeyHex', publicKeyHex)
      Logger.debug('ImportReadOnlyWalletScreen::path', path)
      navigation.navigate(WALLET_INIT_ROUTES.SAVE_READ_ONLY_WALLET, {
        publicKeyHex,
        path,
        networkId: route.params.networkId,
        walletImplementationId: route.params.walletImplementationId,
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
  formatMessage(messages.line2, {
    buttonType: formatMessage(messages.buttonType),
  }),
]

const getContent = (formatMessage) => (
  <ScrollView style={styles.bottomView}>
    <Text style={styles.paragraph}>{formatMessage(messages.paragraph)}</Text>
    {getInstructions(formatMessage).map((row, i) => (
      <BulletPointItem textRow={row} key={i} style={styles.paragraph} />
    ))}
  </ScrollView>
)

const ImportReadOnlyWalletScreen = (
  {intl, onRead}: {intl: IntlShape} & Object /* TODO: type */,
) => (
  <View style={styles.container}>
    <View style={styles.cameraContainer}>
      <QRCodeScanner
        cameraProps={{
          ratio: '1:1',
          height: Dimensions.get('screen').height / 2,
        }}
        cameraStyle={{overflow: 'hidden'}}
        onRead={onRead}
        ref={(node) => {
          scannerRef = node
        }}
      />
    </View>
    {getContent(intl.formatMessage)}
  </View>
)

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}: {intl: IntlShape}) =>
      intl.formatMessage(messages.title),
    ),
    onDidMount(
      async ({
        navigation,
        route,
        intl,
      }: {
        intl: IntlShape,
        route: any,
        navigation: any,
      }) => {
        navigation.addListener('focus', () => {
          // re-enable QR code scanning
          if (
            firstFocus === false &&
            scannerRef != null &&
            scannerRef.reactivate != null
          ) {
            scannerRef.reactivate()
          }
          if (firstFocus === true) firstFocus = false
        })
        if (CONFIG.E2E.IS_TESTING && (await DeviceInfo.isEmulator())) {
          const event = {
            data: `{"publicKeyHex": "${
              CONFIG.DEBUG.PUB_KEY
            }", "path": [1852,1815,0]}`,
          }
          await handleOnRead(event, navigation, route, intl)
        }
      },
    ),
    withHandlers({
      onRead: ({
        navigation,
        route,
        intl,
      }: {
        intl: IntlShape,
        route: any,
        navigation: any,
      }) => async (event) => {
        await handleOnRead(event, navigation, route, intl)
      },
    }),
  )(ImportReadOnlyWalletScreen): ComponentType<{
    navigation: Navigation,
    intl: IntlShape,
    route: any,
  }>),
)
