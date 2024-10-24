import {parseBoolean, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Alert, StyleSheet, Text, View} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useQuery, UseQueryOptions} from 'react-query'

import {Button, ButtonType} from '../../../components/Button/Button'
import {Space} from '../../../components/Space/Space'
import {useEnableAuthWithOs} from '../../Auth/common/hooks'
import {useStrings} from '../common'
import {Biometric} from '../illustrations/Biometric'

export const ChooseBiometricLoginScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  const {setScreenShown, isLoading: isScreenShownLoading} = useSetScreenShown()

  const {enableAuthWithOs, isLoading} = useEnableAuthWithOs({
    onSuccess: () => setScreenShown(),
  })

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <View style={styles.illustration}>
          <Biometric />
        </View>

        <Space height="lg" />

        <Text style={styles.biometricDescription}>{strings.biometricDescription}</Text>
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

        <Space height="sm" />

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

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.pb_lg,
      backgroundColor: color.bg_color_max,
    },
    content: {
      ...atoms.flex_1,
      ...atoms.justify_center,
    },
    illustration: {
      ...atoms.align_center,
    },
    biometricDescription: {
      color: color.text_gray_max,
      ...atoms.heading_3_medium,
      ...atoms.text_center,
      ...atoms.px_lg,
    },
  })

  return {styles} as const
}

const chooseBiometricLoginScreenShownKey = 'choose-biometric-login-screen-shown'
export const useShowBiometricsScreen = (
  options: UseQueryOptions<boolean, Error, boolean, ['useShowBiometricsScreen']> = {},
) => {
  const storage = useAsyncStorage()

  const query = useQuery({
    useErrorBoundary: true,
    suspense: true,
    ...options,
    queryKey: ['useShowBiometricsScreen'],
    queryFn: () => storage.getItem(chooseBiometricLoginScreenShownKey).then((value) => parseBoolean(value) ?? true),
  })

  return {
    ...query,
    showBiometricsScreen: query.data,
  }
}

const useSetScreenShown = () => {
  const storage = useAsyncStorage()

  const mutation = useMutationWithInvalidations({
    mutationFn: async () => storage.setItem(chooseBiometricLoginScreenShownKey, JSON.stringify(false)),
    invalidateQueries: [['useShowBiometricsScreen']],
  })

  return {
    ...mutation,
    setScreenShown: mutation.mutate,
  }
}
