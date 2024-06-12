import {parseBoolean, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Alert, StyleSheet, Text, View} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useQuery, UseQueryOptions} from 'react-query'

import {Button} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useEnableAuthWithOs} from '../../../Auth/common/hooks'
import {useStrings} from '../../common/useStrings'
import {Biometric as BiometricIlustration} from '../../illustrations/Biometric'

export const ChooseBiometricLoginScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  const {setScreenShown, isLoading: isSetScreenShownLoading} = useSetScreenShown()

  const {enableAuthWithOs, isLoading} = useEnableAuthWithOs({
    onSuccess: () => {
      setScreenShown()
    },
  })

  return (
    <SafeAreaView edges={['left', 'right', 'top', 'bottom']} style={styles.root}>
      <View style={styles.content}>
        <View style={styles.illustration}>
          <BiometricIlustration />
        </View>

        <Space height="lg" />

        <Text style={styles.biometricDescription}>{strings.biometricDescription}</Text>
      </View>

      <View>
        <Button
          title={strings.ignoreButton}
          outline
          textStyles={styles.textOutlineButton}
          onPress={() => {
            setScreenShown()
          }}
          disabled={isLoading}
        />

        <Button
          title={strings.enableButton}
          style={styles.enableButton}
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
          disabled={isLoading || isSetScreenShownLoading}
        />

        <Space height="sm" />
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray_cmin,
      ...atoms.px_lg,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    illustration: {
      alignItems: 'center',
    },
    biometricDescription: {
      ...atoms.heading_3_medium,
      color: color.gray_cmax,
      textAlign: 'center',
      ...atoms.px_lg,
    },
    textOutlineButton: {color: color.gray_c900},
    enableButton: {backgroundColor: color.primary_c500},
  })

  return {styles} as const
}

export const chooseBiometricLoginScreenShownKey = 'choose-biometric-login-screen-shown'
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
