import {RouteProp, useFocusEffect, useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StatusBar, StyleSheet, View} from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'

import {BulletPointItem, Spacer, Text} from '../../components'
import {errorMessages} from '../../i18n/global-messages'
import {showErrorDialog} from '../../legacy/actions'
import {Logger} from '../../legacy/logging'
import {WalletInitRouteNavigation, WalletInitRoutes} from '../../navigation'
import {theme} from '../../theme'
import {isCIP1852AccountPath, isValidPublicKey} from '../../yoroi-wallets/cardano/bip44Validators'

export const ImportReadOnlyWalletScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation<WalletInitRouteNavigation>()
  const route = useRoute<RouteProp<WalletInitRoutes, 'import-read-only'>>()
  const {networkId, walletImplementationId} = route.params
  const scannerRef = React.useRef<QRCodeScanner | null>(null)

  const onRead = async (event: {data: string}) => {
    try {
      const {publicKeyHex, path} = await parseReadOnlyWalletKey(event.data)
      navigation.navigate('save-read-only', {
        publicKeyHex,
        path,
        networkId,
        walletImplementationId,
      })
    } catch (error) {
      Logger.debug('ImportReadOnlyWalletScreen::onRead::error', error)
      await showErrorDialog(errorMessages.invalidQRCode, intl)
      scannerRef.current?.reactivate()
    }
  }

  useFocusEffect(React.useCallback(() => scannerRef.current?.reactivate(), []))

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      <View style={styles.cameraContainer}>
        <QRCodeScanner ref={scannerRef} fadeIn onRead={onRead} showMarker customMarker={<CameraOverlay />} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.paragraph}>{strings.paragraph}</Text>
        <Spacer height={16} />
        <BulletPointItem textRow={strings.line1} style={styles.paragraph} />
        <Spacer height={16} />
        <BulletPointItem textRow={strings.line2({buttonType: strings.buttonType})} style={styles.paragraph} />
      </ScrollView>
    </View>
  )
}

const CameraOverlay = () => <View style={styles.scannerOverlay} />

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

const useStrings = () => {
  const intl = useIntl()

  return {
    paragraph: intl.formatMessage(messages.paragraph),
    line1: intl.formatMessage(messages.line1),
    line2: (options) => intl.formatMessage(messages.line2, options),
    buttonType: intl.formatMessage(messages.buttonType),
  }
}

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
  scannerOverlay: {
    height: '75%',
    width: '75%',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 24,
    marginTop: 100,
  },
})

const parseReadOnlyWalletKey = async (text: string): Promise<{publicKeyHex: string; path: number[]}> => {
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
