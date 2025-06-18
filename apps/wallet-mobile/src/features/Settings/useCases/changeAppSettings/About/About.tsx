import messaging from '@react-native-firebase/messaging'
import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Pressable, StyleSheet, Text, View} from 'react-native'
import {useQuery} from 'react-query'

import {Copiable} from '../../../../../components/Clipboard/Copiable'
import {appInfo} from '../../../../../kernel/appInfo'
import {commit} from '../../../../../kernel/env'
import {SettingsRouteNavigation} from '../../../../../kernel/navigation'

export const About = () => {
  const strings = useStrings()
  const styles = useStyles()
  const navigation = useNavigation<SettingsRouteNavigation>()
  const {data: FCMToken} = useQuery({
    useErrorBoundary: false,
    suspense: false,
    queryFn: () => messaging().getToken(),
  })

  return (
    <View style={styles.about}>
      <View style={styles.row}>
        <Text style={styles.labelText}>{strings.currentVersion}</Text>

        <Pressable onLongPress={() => navigation.navigate('settings-system-log')}>
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
              <Text style={styles.valueText} numberOfLines={1} ellipsizeMode="middle">
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
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    about: {
      flex: 1,
      backgroundColor: color.bg_color_max,
      ...atoms.p_lg,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      ...atoms.py_lg,
    },
    labelText: {
      color: color.gray_900,
      ...atoms.body_1_lg_medium,
    },
    valueText: {
      color: color.gray_500,
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
