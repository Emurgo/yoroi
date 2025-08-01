import {useFocusEffect} from '@react-navigation/native'
import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {
  parseBoolean,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Alert, Text, View} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useMetrics} from '~/kernel/metrics/metricsManager'

import {Button, ButtonType} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Biometric} from '../illustrations/Biometric'

export const ChooseBiometricLoginScreen = () => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.onboardingBiometricsPageViewed()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  )

  const {setScreenShown, isLoading: isScreenShownLoading} = useSetScreenShown()

  const {enableAuthWithOs, isLoading} = useEnableAuthWithOs({
    onSuccess: () => setScreenShown(),
  })

  return (
    <SafeAreaView style={[a.flex_1, a.px_lg, a.pb_lg, ta.bg_color_max]}>
      <View style={[a.flex_1, a.justify_center]}>
        <View style={a.align_center}>
          <Biometric />
        </View>

        <Space.Height.lg />

        <Text
          style={[ta.text_gray_max, a.heading_3_medium, a.text_center, a.px_lg]}
        >
          {strings.biometricDescription}
        </Text>
      </View>

      <View>
        <Button
          type={ButtonType.Text}
          title={strings.ignoreButton}
          onPress={() => {
            setScreenShown()
          }}
          disabled={isLoading}
        />

        <Space.Height.sm />

        <Button
          title={strings.enableButton}
          onPress={async () => {
            const isSimulator = await DeviceInfo.isEmulator()
            if (isSimulator) {
              Alert.alert(
                'Running on Simulator',
                "Running on simulator so OS auth doesn't work. You will go directly to wallet creation",
                [
                  {
                    text: 'OK',
                    onPress: () => setScreenShown(),
                  },
                ],
              )
              return
            }

            enableAuthWithOs()
          }}
          disabled={isLoading || isScreenShownLoading}
        />
      </View>
    </SafeAreaView>
  )
}

const chooseBiometricLoginScreenShownKey = 'choose-biometric-login-screen-shown'
export const useShowBiometricsScreen = (
  options: UseQueryOptions<
    boolean,
    Error,
    boolean,
    ['useShowBiometricsScreen']
  > = {},
) => {
  const storage = useAsyncStorage()

  const query = useQuery({
    useErrorBoundary: true,
    suspense: true,
    ...options,
    queryKey: ['useShowBiometricsScreen'],
    queryFn: () =>
      storage
        .getItem(chooseBiometricLoginScreenShownKey)
        .then((value) => parseBoolean(value) ?? true),
  })

  return {
    ...query,
    showBiometricsScreen: query.data,
  }
}

const useSetScreenShown = () => {
  const storage = useAsyncStorage()

  const mutation = useMutationWithInvalidations({
    mutationFn: async () =>
      storage.setItem(
        chooseBiometricLoginScreenShownKey,
        JSON.stringify(false),
      ),
    invalidateQueries: [['useShowBiometricsScreen']],
  })

  return {
    ...mutation,
    setScreenShown: mutation.mutate,
  }
}
