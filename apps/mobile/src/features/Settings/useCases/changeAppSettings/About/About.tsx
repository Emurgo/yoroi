import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Pressable, StyleSheet, Text, View} from 'react-native'

import {commit} from '../../../../../kernel/constants'
import {SettingsRouteNavigation} from '../../../../../kernel/navigation/navigation'
import {Copiable} from '../../../../../ui/Copiable/Copiable'

export const About = () => {
  const strings = useStrings()
  const styles = useStyles()
  const navigation = useNavigation<SettingsRouteNavigation>()
  const {data: FCMToken} = {
    data: 'efh848gh4498gh4g904g',
  }
  const appInfo = {
    version: '5.2.2',
  }

  return (
    <View style={styles.about}>
      <View style={styles.row}>
        <Text style={styles.labelText}>{strings.currentVersion}</Text>

        <Pressable
          onLongPress={() => navigation.navigate('settings-system-log')}
        >
          <Text style={styles.valueText}>{appInfo.version}</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={styles.labelText}>{strings.commit}</Text>

        <Text style={styles.valueText}>{commit}</Text>
      </View>

      {FCMToken !== undefined && (
        <>
          <Text style={styles.labelText}>{strings.fcmToken}</Text>

          <Copiable text={FCMToken}>
            <View style={{flex: 1}}>
              <Text
                style={styles.valueText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {FCMToken}
              </Text>
            </View>
          </Copiable>
        </>
      )}
    </View>
  )
}

const useStyles = () => {
  const {palette: p} = useTheme()
  const styles = StyleSheet.create({
    about: {
      flex: 1,
      backgroundColor: p.bg_color_max,
      ...a.p_lg,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      ...a.py_lg,
    },
    labelText: {
      color: p.gray_900,
      ...a.body_1_lg_medium,
    },
    valueText: {
      color: p.gray_500,
      ...a.body_1_lg_regular,
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
    fcmToken: intl.formatMessage(messages.fcmToken),
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
  fcmToken: {
    id: 'components.settings.walletsettingscreen.fcmToken',
    defaultMessage: '!!!FCM Token',
  },
})
