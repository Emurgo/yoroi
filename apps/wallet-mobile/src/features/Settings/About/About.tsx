import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TextProps, View, ViewProps} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {Text} from '../../../components'
import {CONFIG} from '../../../legacy/config'
import {useSelectedWallet} from '../../../SelectedWallet'
import {lightPalette} from '../../../theme'
import {getNetworkConfigById} from '../../../yoroi-wallets/cardano/networks'
import {isHaskellShelley} from '../../../yoroi-wallets/cardano/utils'

const version = DeviceInfo.getVersion()

export const About = () => {
  const strings = useStrings()

  const wallet = useSelectedWallet()
  const network = getNetworkConfigById(wallet.networkId).MARKETING_NAME
  const walletType = isHaskellShelley(wallet.walletImplementationId) ? strings.shelleyWallet : strings.unknownWalletType

  return (
    <View style={styles.about}>
      <Row>
        <LabelText>{strings.currentVersion}</LabelText>

        <ValueText>{version}</ValueText>
      </Row>

      <Row>
        <LabelText>{strings.commit}</LabelText>

        <ValueText>{CONFIG.COMMIT}</ValueText>
      </Row>

      <Row>
        <LabelText>{strings.network}</LabelText>

        <ValueText>{network}</ValueText>
      </Row>

      <Row>
        <LabelText>{strings.walletType}</LabelText>

        <ValueText>{walletType}</ValueText>
      </Row>
    </View>
  )
}

const Row = ({style, ...props}: ViewProps) => <View {...props} style={[styles.row, style]} />

const LabelText = ({style, children, ...props}: TextProps) => (
  <Text
    {...props}
    style={[{fontFamily: 'Rubik-Medium', color: lightPalette.gray['900'], fontSize: 16, lineHeight: 24}, style]}
  >
    {children}
  </Text>
)

const ValueText = ({style, children, ...props}: TextProps) => (
  <Text
    {...props}
    style={[{fontFamily: 'Rubik-Regular', fontSize: 16, lineHeight: 24, color: lightPalette.gray['500']}, style]}
  >
    {children}
  </Text>
)

const styles = StyleSheet.create({
  about: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    currentVersion: intl.formatMessage(messages.currentVersion),
    commit: intl.formatMessage(messages.commit),
    network: intl.formatMessage(messages.network),
    walletType: intl.formatMessage(messages.walletType),
    byronWallet: intl.formatMessage(messages.byronWallet),
    shelleyWallet: intl.formatMessage(messages.shelleyWallet),
    unknownWalletType: intl.formatMessage(messages.unknownWalletType),
  }
}

const messages = defineMessages({
  currentVersion: {
    id: 'global.currentVersion',
    defaultMessage: '!!!Current Version',
  },
  commit: {
    id: 'global.commit',
    defaultMessage: '!!!Commit',
  },
  network: {
    id: 'global.network',
    defaultMessage: '!!!Network',
  },
  walletType: {
    id: 'components.settings.applicationsettingsscreen.walletType',
    defaultMessage: '!!!Wallet type',
  },
  byronWallet: {
    id: 'components.settings.walletsettingscreen.byronWallet',
    defaultMessage: '!!!Byron-era wallet',
  },
  shelleyWallet: {
    id: 'components.settings.walletsettingscreen.shelleyWallet',
    defaultMessage: '!!!Shelley-era wallet',
  },
  unknownWalletType: {
    id: 'components.settings.walletsettingscreen.unknownWalletType',
    defaultMessage: '!!!Unknown Wallet Type',
  },
})
