import {atoms as a, useTheme} from '@yoroi/theme'

import * as Notifications from 'expo-notifications'
import * as React from 'react'
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePromise} from '~/hooks/usePromise'
import {appVersion, commit} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Copiable} from '~/ui/Copiable/Copiable'

export const AboutScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {value: FCMToken} = usePromise({
    promise: Notifications.getDevicePushTokenAsync,
  })

  return (
    <SafeAreaView
      style={[a.flex_1, a.p_lg, a.gap_2xl]}
      edges={['left', 'right', 'bottom']}
    >
      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
          {strings.settings.about.currentVersion}
        </Text>

        <Text
          style={[a.body_1_lg_regular, ta.text_gray_medium]}
          numberOfLines={1}
        >
          {appVersion}
        </Text>
      </View>

      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
          {strings.settings.about.commit}
        </Text>

        <Text
          style={[a.body_1_lg_regular, ta.text_gray_medium]}
          numberOfLines={1}
        >
          {commit}
        </Text>
      </View>

      {FCMToken != null && (
        <View style={[a.flex_row, a.justify_between, a.align_center]}>
          <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
            {strings.settings.about.fcmToken}
          </Text>

          <Copiable text={FCMToken.data}>
            <Text
              style={[a.body_1_lg_regular, ta.text_gray_medium]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {FCMToken.data}
            </Text>
          </Copiable>
        </View>
      )}
    </SafeAreaView>
  )
}
