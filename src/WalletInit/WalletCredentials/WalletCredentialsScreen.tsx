import {RouteProp, useRoute} from '@react-navigation/native'
import React from 'react'
import {ActivityIndicator, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useCreateWallet} from '../../hooks'
import {useWalletNavigation, WalletInitRoutes} from '../../navigation'
import {COLORS} from '../../theme'
import {WalletForm} from '../WalletForm'

export const WalletCredentialsScreen = () => {
  const {resetToWalletSelection} = useWalletNavigation()
  const route = useRoute<RouteProp<WalletInitRoutes, 'wallet-credentials'>>()
  const {phrase, networkId, walletImplementationId, provider} = route.params

  const {createWallet, isLoading, isSuccess} = useCreateWallet({
    onSuccess: async () => {
      resetToWalletSelection()
    },
  })

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <WalletForm
        onSubmit={
          isLoading || isSuccess
            ? NOOP
            : ({name, password}) =>
                createWallet({name, password, mnemonicPhrase: phrase, networkId, walletImplementationId, provider})
        }
      />
      {isLoading && <ActivityIndicator color="black" />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
})

const NOOP = () => undefined
