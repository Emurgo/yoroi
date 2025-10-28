import {
  parseBoolean,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'

import {UseSuspenseQueryOptions, useSuspenseQuery} from '@tanstack/react-query'
import * as React from 'react'
import {Alert, Text, View} from 'react-native'
import * as DeviceInfo from 'react-native-device-info'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {usePromise} from '~/hooks/usePromise'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {Button, ButtonType} from '~/ui/Button/Button'

import {Biometric} from '../illustrations/Biometric'

export const ChooseBiometricLoginScreen = () => {
  const {atoms: ta} = useTheme()
  const {enableLoginWithHost} = useAuth()
  const strings = useStrings()

  const {setScreenShown, isPending: isScreenShownLoading} = useSetScreenShown()
  const {isPending, resolve} = usePromise({
    promise: enableLoginWithHost,
    onSuccess: (isOk) => {
      if (isOk) setScreenShown()
    },
    onError: (error) => {
      logger.error(error, {
        origin: 'ChooseBiometricLoginScreen',
        type: 'user',
      })
    },
  })

  const isLoading = isScreenShownLoading || isPending

  return (
    <SafeAreaView style={[a.flex_1, ta.bg_color_max]}>
      <View style={[a.flex_1, a.justify_center, a.gap_lg, a.px_lg]}>
        <View style={a.align_center}>
          <Biometric />
        </View>

        <View style={[a.align_center, a.gap_xs]}>
          <Text style={[ta.text_gray_max, a.heading_3_medium, a.text_center]}>
            {strings.settings.enableLoginWithOs.heading}
          </Text>
          <Text style={[ta.text_gray_max, a.body_1_lg_medium, a.text_center]}>
            {strings.settings.enableLoginWithOs.subHeading1}
          </Text>
          <Text style={[ta.text_gray_max, a.body_1_lg_medium, a.text_center]}>
            {strings.settings.enableLoginWithOs.subHeading2}
          </Text>
        </View>
      </View>

      <View style={[a.gap_sm, a.px_lg, a.pb_lg]}>
        <Button
          type={ButtonType.Text}
          title={strings.settings.enableLoginWithOs.notNowButton}
          onPress={() => {
            setScreenShown()
          }}
          disabled={isLoading}
        />

        <Button
          title={strings.settings.enableLoginWithOs.linkButton}
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

            resolve({noFallback: true})
          }}
          disabled={isLoading}
        />
      </View>
    </SafeAreaView>
  )
}

const chooseBiometricLoginScreenShownKey = 'choose-biometric-login-screen-shown'
export const useShowBiometricsScreen = (
  options: Partial<
    UseSuspenseQueryOptions<
      boolean,
      Error,
      boolean,
      ['useShowBiometricsScreen']
    >
  > = {},
) => {
  const storage = useAsyncStorage()

  const query = useSuspenseQuery({
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
