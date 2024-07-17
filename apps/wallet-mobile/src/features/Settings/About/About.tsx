import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Pressable, StyleSheet, TextProps, View, ViewProps} from 'react-native'

import {Text} from '../../../components'
import {appInfo} from '../../../kernel/appInfo'
import {commit} from '../../../kernel/env'
import {SettingsRouteNavigation} from '../../../kernel/navigation'

export const About = () => {
  const strings = useStrings()
  const styles = useStyles()
  const navigation = useNavigation<SettingsRouteNavigation>()

  return (
    <View style={styles.about}>
      <Row>
        <LabelText>{strings.currentVersion}</LabelText>

        <Pressable onLongPress={() => navigation.navigate('settings-system-log')}>
          <ValueText>{appInfo.version}</ValueText>
        </Pressable>
      </Row>

      <Row>
        <LabelText>{strings.commit}</LabelText>

        <ValueText>{commit}</ValueText>
      </Row>
    </View>
  )
}

const Row = ({style, ...props}: ViewProps) => {
  const styles = useStyles()
  return <View {...props} style={[styles.row, style]} />
}

const LabelText = ({style, children, ...props}: TextProps) => {
  const styles = useStyles()

  return (
    <Text {...props} style={[styles.labelText, style]}>
      {children}
    </Text>
  )
}

const ValueText = ({style, children, ...props}: TextProps) => {
  const styles = useStyles()

  return (
    <Text {...props} style={[styles.valueText, style]}>
      {children}
    </Text>
  )
}
const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    about: {
      flex: 1,
      backgroundColor: color.bg_color_high,
      ...atoms.p_lg,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      ...atoms.py_lg,
    },
    labelText: {
      color: color.gray_c900,
      ...atoms.body_1_lg_medium,
    },
    valueText: {
      color: color.gray_c500,
      ...atoms.body_1_lg_regular,
    },
  })

  return styles
}

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
