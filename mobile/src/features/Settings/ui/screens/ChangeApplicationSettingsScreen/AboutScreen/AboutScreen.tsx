import {time} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'
import Animated, {
  FadeInDown,
  FadeOutDown,
  FadingTransition,
} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {appVersion, commit} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Copiable} from '~/ui/Copiable/Copiable'

import {useNavigateTo} from '../../../../hooks/useNavigateTo'
import {useFirebaseConfig} from './useFirebaseConfig'

const TAP_COUNT_THRESHOLD = 5
const TAP_TIMEOUT_MS = 2000
const FEEDBACK_TIMEOUT = time.seconds(2)

const DevModeFeedback = React.memo(({message}: {message: string}) => {
  const {atoms: ta} = useTheme()
  const {height} = useWindowDimensions()

  return (
    <Animated.View
      layout={FadingTransition}
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={[
        a.absolute,
        ta.bg_color_min,
        a.align_center,
        a.justify_center,
        a.rounded_sm,
        a.z_10,
        {
          top: height * 0.65,
          alignSelf: 'center',
          minWidth: 120,
        },
      ]}
    >
      <Text
        style={[a.align_center, a.p_sm, a.body_2_md_medium, ta.text_gray_max]}
      >
        {message}
      </Text>
    </Animated.View>
  )
})

export const AboutScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const firebaseConfig = useFirebaseConfig()
  const navigation = useNavigateTo()
  const {isAuthDev, toggleDevMode} = useAuth()
  const [tapCount, setTapCount] = React.useState(0)
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(
    null,
  )
  const tapTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const feedbackTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleOnLongPress = () => {
    navigation.systemLog()
  }

  const handleBackgroundTap = () => {
    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current)
    }

    const newTapCount = tapCount + 1
    setTapCount(newTapCount)

    if (newTapCount >= TAP_COUNT_THRESHOLD) {
      // Toggle and show feedback (message shows new state after toggle)
      const newIsDev = !isAuthDev
      toggleDevMode()
      const message = newIsDev ? 'Dev mode enabled' : 'Dev mode disabled'
      setFeedbackMessage(message)

      // Clear feedback after timeout
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current)
      }
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedbackMessage(null)
      }, FEEDBACK_TIMEOUT)

      setTapCount(0)
    } else {
      // Reset tap count after timeout
      tapTimeoutRef.current = setTimeout(() => {
        setTapCount(0)
      }, TAP_TIMEOUT_MS)
    }
  }

  React.useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current)
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current)
      }
    }
  }, [])

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleBackgroundTap}
      style={[a.flex_1]}
    >
      <SafeAreaView
        style={[a.flex_1, a.px_lg, a.pt_lg, a.gap_2xl, ta.bg_color_max]}
        edges={['left', 'right', 'bottom']}
      >
        <View style={[a.flex_row, a.justify_between, a.align_center]}>
          <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
            {strings.settings.about.currentVersion}
          </Text>

          <Pressable onLongPress={handleOnLongPress}>
            <Text
              style={[a.body_1_lg_regular, ta.text_gray_medium]}
              numberOfLines={1}
            >
              {appVersion}
            </Text>
          </Pressable>
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

        {firebaseConfig?.fcmToken != null && (
          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
              {strings.settings.about.fcmToken}
            </Text>

            <Copiable text={firebaseConfig.fcmToken}>
              <Text
                style={[a.body_1_lg_regular, ta.text_gray_medium]}
                numberOfLines={1}
              >
                {`${firebaseConfig.fcmToken.slice(0, 8)}...${firebaseConfig.fcmToken.slice(-8)}`}
              </Text>
            </Copiable>
          </View>
        )}

        {firebaseConfig?.projectId != null && (
          <View style={[a.flex_row, a.justify_between, a.align_center]}>
            <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
              {strings.settings.about.firebaseProjectId}
            </Text>

            <Text
              style={[a.body_1_lg_regular, ta.text_gray_medium]}
              numberOfLines={1}
            >
              {firebaseConfig.projectId}{' '}
              {firebaseConfig.hasPermission ? '✅' : '❌'}
            </Text>
          </View>
        )}
      </SafeAreaView>
      {feedbackMessage && <DevModeFeedback message={feedbackMessage} />}
    </TouchableOpacity>
  )
}
