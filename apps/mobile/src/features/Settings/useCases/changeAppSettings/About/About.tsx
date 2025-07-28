import {useNavigation} from '@react-navigation/native'
import {useQuery} from '@tanstack/react-query'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Pressable, Text, View} from 'react-native'

import {commit} from '../../../../../kernel/constants'
import {SettingsRouteNavigation} from '../../../../../kernel/navigation/navigation'
import {Copiable} from '../../../../../ui/Copiable/Copiable'

export const About = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const navigation = useNavigation<SettingsRouteNavigation>()
  const {data: FCMToken} = useQuery({
    useErrorBoundary: false,
    suspense: false,
    queryFn: () => messaging().getToken(),
  })

  return (
    <View style={[a.flex_1, ta.bg_color_max, a.p_lg]}>
      <View style={[a.flex_row, a.justify_between, a.py_lg]}>
        <Text
          style={[
            {
              color: p.gray_900,
            },
            a.body_1_lg_medium,
          ]}
        >
          {strings.currentVersion}
        </Text>

        <Pressable
          onLongPress={() => navigation.navigate('settings-system-log')}
        >
          <Text
            style={[
              {
                color: p.gray_500,
              },
              a.body_1_lg_regular,
            ]}
          >
            {appInfo.version}
          </Text>
        </Pressable>
      </View>

      <View style={[a.flex_row, a.justify_between, a.py_lg]}>
        <Text
          style={[
            {
              color: p.gray_900,
            },
            a.body_1_lg_medium,
          ]}
        >
          {strings.commit}
        </Text>

        <Text
          style={[
            {
              color: p.gray_500,
            },
            a.body_1_lg_regular,
          ]}
        >
          {commit}
        </Text>
      </View>

      {FCMToken !== undefined && (
        <>
          <Text
            style={[
              {
                color: p.gray_900,
              },
              a.body_1_lg_medium,
            ]}
          >
            {strings.fcmToken}
          </Text>

          <Copiable text={FCMToken}>
            <View style={{flex: 1}}>
              <Text
                style={[
                  {
                    color: p.gray_500,
                  },
                  a.body_1_lg_regular,
                ]}
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
