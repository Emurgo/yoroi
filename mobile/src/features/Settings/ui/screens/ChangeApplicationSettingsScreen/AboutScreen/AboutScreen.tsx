import {atoms as a, useTheme} from '@yoroi/theme'

import messaging from '@react-native-firebase/messaging'
import * as React from 'react'
import {ScrollView, Text, TouchableHighlight, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {appVersion, commit, isDev, isNightly} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {Copiable} from '~/ui/Copiable/Copiable'

import {useNavigateTo} from '../../../../hooks/useNavigateTo'

export const AboutScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const [fcmToken, setFcmToken] = React.useState<string | null>(null)
  const navigation = useNavigateTo()

  const handleOnLongPress = () => {
    navigation.systemLog()
  }

  React.useEffect(() => {
    if (!(isNightly || isDev)) return
    ;(async () => {
      try {
        // Request permission first
        const authStatus = await messaging().requestPermission()
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL

        if (!enabled) {
          logger.warn('FCM: Permission not granted')
          return
        }

        // Get FCM token
        const token = await messaging().getToken()
        setFcmToken(token)
        logger.info(`AboutScreen FCM Token: ${token}`)
      } catch (error) {
        logger.error('AboutScreen: Error getting FCM token', {
          error: error instanceof Error ? error.message : String(error),
        })
      }
    })()
  }, [])
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

      {(isNightly || isDev) && fcmToken && (
        <View style={[a.gap_sm]}>
          <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
            FCM Token
          </Text>

          <Copiable text={fcmToken}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={[a.flex_shrink]}
            >
              <Text
                style={[a.body_2_md_regular, ta.text_gray_medium]}
                selectable
              >
                {fcmToken}
              </Text>
            </ScrollView>
          </Copiable>
        </View>
      )}
    </SafeAreaView>
  )
}
