import {useNavigation} from '@react-navigation/native'
import {useSetupWallet} from '@yoroi/setup-wallet'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StatusBar, StyleSheet, View} from 'react-native'

import {BulletPointItem, CameraCodeScanner, Spacer, Text} from '../../../../components'
import {showErrorDialog} from '../../../../kernel/dialogs'
import {errorMessages} from '../../../../kernel/i18n/global-messages'
import {logger} from '../../../../kernel/logger/logger'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {isCIP1852AccountPath, isValidPublicKey} from '../../../../yoroi-wallets/cardano/bip44Validators'

export const ImportReadOnlyWalletScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const {publicKeyHexChanged, pathChanged} = useSetupWallet()

  const onRead = async (event: {data: string}): Promise<boolean> => {
    try {
      const {publicKeyHex, path} = await parseReadOnlyWalletKey(event.data)

      publicKeyHexChanged(publicKeyHex)
      pathChanged(path)

      navigation.navigate('setup-wallet-save-read-only')
    } catch (error) {
      logger.error(error as Error)
      await showErrorDialog(errorMessages.invalidQRCode, intl)
      return Promise.resolve(true)
    }

    return Promise.resolve(false)
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      <View style={styles.cameraContainer}>
        <CameraCodeScanner onRead={onRead} />
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
    line2: (options: {buttonType: string}) => intl.formatMessage(messages.line2, options),
    buttonType: intl.formatMessage(messages.buttonType),
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

const parseReadOnlyWalletKey = async (text: string): Promise<{publicKeyHex: string; path: number[]}> => {
  const dataObj = JSON.parse(text)
  const {publicKeyHex, path} = dataObj
  if (isCIP1852AccountPath(path) && (await isValidPublicKey(publicKeyHex))) {
    return {publicKeyHex, path}
  }

  throw new Error('invalid QR code')
}
