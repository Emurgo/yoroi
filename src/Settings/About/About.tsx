import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TextProps, View, ViewProps} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {Text} from '../../components'
import {CONFIG, isByron, isHaskellShelley} from '../../legacy/config'
import {getNetworkConfigById} from '../../legacy/networks'
import {useSelectedWallet} from '../../SelectedWallet'
import {lightPalette} from '../../theme'
import {NetworkId, WalletImplementationId} from '../../yoroi-wallets'

const version = DeviceInfo.getVersion()

export const About = () => {
  const strings = useStrings()

  const wallet = useSelectedWallet()
  const network = getNetworkName(wallet.networkId)
  const walletType = getWalletType(wallet.walletImplementationId, strings)

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
  <Text {...props} style={[{fontFamily: 'Rubik-Medium', fontSize: 16, lineHeight: 24}, style]}>
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

const getNetworkName = (networkId: NetworkId) => {
  // note(v-almonacid): this throws when switching wallet
  try {
    const config = getNetworkConfigById(networkId)
    return config.MARKETING_NAME
  } catch (_e) {
    return '-'
  }
}

const getWalletType = (implementationId: WalletImplementationId, strings): string => {
  if (isByron(implementationId)) return strings.byronWallet
  if (isHaskellShelley(implementationId)) return strings.shelleyWallet

  return strings.unknownWalletType
}

const styles = StyleSheet.create({
  about: {
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
    id: 'components.settings.about.currentVersion',
    defaultMessage: '!!!Current Version',
  },
  commit: {
    id: 'components.settings.about.commit',
    defaultMessage: '!!!Commit',
  },
  network: {
    id: 'components.settings.about.network',
    defaultMessage: '!!!Netwok',
  },
  walletType: {
    id: 'components.settings.about.walletType',
    defaultMessage: '!!!Wallet type',
  },
  byronWallet: {
    id: 'components.settings.about.byronWallet',
    defaultMessage: '!!!Byron-era wallet',
  },
  shelleyWallet: {
    id: 'components.settings.about.shelleyWallet',
    defaultMessage: '!!!Shelley-era wallet',
  },
  unknownWalletType: {
    id: 'components.settings.about.unknownWalletType',
    defaultMessage: '!!!Unknown Wallet Type',
  },
})
