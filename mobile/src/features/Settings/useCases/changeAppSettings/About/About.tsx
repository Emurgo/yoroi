import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {appVersion, commit} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Space} from '~/ui/Space/Space'

// TODO: REVISIT after firebase messaging is back
const FCMToken = ''

export const About = () => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()

  return (
    <SafeAreaView
      style={[a.p_lg, a.gap_lg]}
      edges={['left', 'right', 'bottom']}
    >
      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_1_lg_medium, {color: p.gray_900}]}>
          {strings.settings.about.currentVersion}
        </Text>

        <Text
          style={[a.body_1_lg_regular, ta.text_gray_medium]}
          numberOfLines={1}
        >
          {appVersion}
        </Text>
      </View>

      <Space.Height.xs />

      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <Text style={[a.body_1_lg_medium, {color: p.gray_900}]}>
          {strings.settings.about.commit}
        </Text>

        <Text
          style={[a.body_1_lg_regular, {color: p.gray_500}]}
          numberOfLines={1}
        >
          {commit}
        </Text>
      </View>

      <Space.Height.xs />

      {FCMToken !== undefined && (
        <View style={[a.flex_row, a.justify_between, a.align_center]}>
          <Text style={[a.body_1_lg_medium, {color: p.gray_900}]}>
            {strings.settings.about.fcmToken}
          </Text>

          <Copiable text={FCMToken}>
            <Text
              style={[a.body_1_lg_regular, {color: p.gray_500}]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {FCMToken}
            </Text>
          </Copiable>
        </View>
      )}
    </SafeAreaView>
  )
}
