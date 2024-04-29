import {useNavigation} from '@react-navigation/native'
import {parseBoolean, useAsyncStorage} from '@yoroi/common'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Alert, StyleSheet, Text, View} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useQuery, UseQueryOptions} from 'react-query'

import {Button} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useEnableAuthWithOs} from '../../../../yoroi-wallets/auth'
import * as HASKELL_SHELLEY from '../../../../yoroi-wallets/cardano/constants/mainnet/constants'
import {useStrings} from '../../common/useStrings'
import {Biometric as BiometricIlustration} from '../../illustrations/Biometric'

export const ChooseBiometricLoginScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const storage = useAsyncStorage()
  const {walletImplementationIdChanged} = useSetupWallet()

  const navigate = () => {
    walletImplementationIdChanged(HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID)
    navigation.navigate('new-wallet', {
      screen: 'setup-wallet-choose-setup-type',
    })
  }

  const {enableAuthWithOs, isLoading} = useEnableAuthWithOs({
    onSuccess: () => {
      setScreenShown()
      navigate()
    },
  })

  const setScreenShown = () => {
    storage.setItem(chooseBiometricLoginScreenShownKey, JSON.stringify(false))
  }

  const navigation = useNavigation()

  return (
    <SafeAreaView edges={['left', 'right', 'top', 'bottom']} style={styles.root}>
      <View style={styles.content}>
        <View style={styles.illustration}>
          <BiometricIlustration />
        </View>

        <Space height="l" />

        <Text style={styles.biometricDescription}>{strings.biometricDescription}</Text>
      </View>

      <View>
        <Button
          title={strings.ignoreButton}
          outline
          textStyles={styles.textOutlineButton}
          onPress={() => {
            setScreenShown()
            navigate()
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
                    onPress: navigate,
                  },
                ],
              )

              return
            }

            enableAuthWithOs()
          }}
          disabled={isLoading}
        />

        <Space height="s" />
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.white_static,
      ...theme.atoms.px_lg,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    illustration: {
      alignItems: 'center',
    },
    biometricDescription: {
      ...theme.atoms.heading_3_medium,
      color: theme.color.gray_cmax,
      textAlign: 'center',
      ...theme.atoms.px_lg,
    },
    textOutlineButton: {color: theme.color.gray_c900},
    enableButton: {backgroundColor: theme.color.primary_c500},
  })

  return {styles} as const
}

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

export const chooseBiometricLoginScreenShownKey = 'choose-biometric-login-screen-shown'
