import {atoms as a, useTheme} from '@yoroi/theme'

import * as Notifications from 'expo-notifications'
import * as React from 'react'
import {Text, TouchableHighlight, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePromise} from '~/hooks/usePromise'
import {appVersion, commit} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Copiable} from '~/ui/Copiable/Copiable'

import {useNavigateTo} from '../../../../hooks/useNavigateTo'

export const AboutScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {value: FCMToken} = usePromise({
    promise: Notifications.getDevicePushTokenAsync,
  })
  const navigation = useNavigateTo()

  const handleOnLongPress = () => {
    navigation.systemLog()
  }

  return (
    <SafeAreaView
      style={[a.flex_1, a.px_lg, a.pt_lg, a.gap_2xl, ta.bg_color_max]}
      edges={['left', 'right', 'bottom']}
    >
      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
          {strings.settings.about.currentVersion}
        </Text>

        <TouchableHighlight onLongPress={handleOnLongPress}>
          <Text
            style={[a.body_1_lg_regular, ta.text_gray_medium]}
            numberOfLines={1}
          >
            {appVersion}
          </Text>
        </TouchableHighlight>
      </View>

      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
          {strings.settings.about.commit}
        </Text>

        <Text
          style={[a.body_1_lg_regular, ta.text_gray_medium]}
          numberOfLines={1}
        >
          {commit?.slice(0, 9)}
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
