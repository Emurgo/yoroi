/* eslint-disable react-native/no-inline-styles */
// @flow

import React from 'react'
import {View, ScrollView, StyleSheet, StatusBar} from 'react-native'
import {useIntl, defineMessages} from 'react-intl'
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native'
import QRCodeScanner from 'react-native-qrcode-scanner'

import {theme} from '../../../styles/config'
import {Text, BulletPointItem, Spacer} from '../../UiKit'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {Logger} from '../../../utils/logging'
import {errorMessages} from '../../../i18n/global-messages'
import {showErrorDialog} from '../../../actions'
import {isValidPublicKey, isCIP1852AccountPath} from '../../../utils/bip44Validators'

const messages = defineMessages({
  paragraph: {
    id: 'components.walletinit.importreadonlywalletscreen.paragraph',
    defaultMessage: '!!!To import a read-only wallet from the Yoroi extension, you will need to:',
  },
  line1: {
    id: 'components.walletinit.importreadonlywalletscreen.line1',
    defaultMessage: '!!!Open "My wallets" page in the Yoroi extension.',
  },
  line2: {
    id: 'components.walletinit.importreadonlywalletscreen.line2',
    defaultMessage: '!!!Look for the {buttonType} for the wallet you want to import in the mobile app.',
  },
  buttonType: {
    id: 'components.walletinit.importreadonlywalletscreen.buttonType',
    defaultMessage: '!!!export read-only wallet button',
  },
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.BACKGROUND,
  },
  cameraContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  scrollView: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
})

const parseReadOnlyWalletKey = async (text: string) => {
  Logger.debug('ImportReadOnlyWalletScreen::handleOnRead::data', text)
  const dataObj = JSON.parse(text)
  const {publicKeyHex, path} = dataObj
  if (isCIP1852AccountPath(path) && (await isValidPublicKey(publicKeyHex))) {
    Logger.debug('ImportReadOnlyWalletScreen::publicKeyHex', publicKeyHex)
    Logger.debug('ImportReadOnlyWalletScreen::path', path)
  } else {
    throw new Error('invalid QR code')
  }

  return {publicKeyHex, path}
}

export type Params = {
  networkId: string,
  walletImplementationId: string,
}

const ImportReadOnlyWalletScreen = () => {
  const intl = useIntl()
  const navigation = useNavigation()
  const route = useRoute()
  const {networkId, walletImplementationId}: Params = (route.params: any)
  const scannerRef = React.useRef<{reactivate: () => mixed} | null>(null)

  const onRead = (event: {data: string}) => {
    parseReadOnlyWalletKey(event.data)
      .then(({publicKeyHex, path}: {publicKeyHex: string, path: string}) =>
        navigation.navigate(WALLET_INIT_ROUTES.SAVE_READ_ONLY_WALLET, {
          publicKeyHex,
          path,
          networkId,
          walletImplementationId,
        }),
      )
      .catch((error: Error) => {
        Logger.debug('ImportReadOnlyWalletScreen::onRead::error', error)
        showErrorDialog(errorMessages.invalidQRCode, intl)
      })
  }

  useFocusEffect(
    React.useCallback(() => {
      scannerRef.current?.reactivate()
    }, []),
  )

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor={'transparent'} />

      <View style={styles.cameraContainer}>
        <QRCodeScanner ref={scannerRef} fadeIn onRead={onRead} showMarker customMarker={<CameraOverlay />} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.paragraph}>{intl.formatMessage(messages.paragraph)}</Text>
        <Spacer height={16} />
        <BulletPointItem textRow={intl.formatMessage(messages.line1)} style={styles.paragraph} />
        <Spacer height={16} />
        <BulletPointItem
          textRow={intl.formatMessage(messages.line2, {
            buttonType: intl.formatMessage(messages.buttonType),
          })}
          style={styles.paragraph}
        />
      </ScrollView>
    </View>
  )
}

export default ImportReadOnlyWalletScreen

const CameraOverlay = () => (
  <View
    // eslint-disable-next-line react-native/no-inline-styles
    style={{
      height: '75%',
      width: '75%',
      borderWidth: 2,
      borderColor: 'white',
      borderRadius: 24,
      marginTop: 100,
    }}
  />
)
