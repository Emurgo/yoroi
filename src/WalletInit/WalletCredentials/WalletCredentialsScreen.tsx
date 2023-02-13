import {RouteProp, useRoute} from '@react-navigation/native'
import React from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, InteractionManager, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {showErrorDialog} from '../../dialogs'
import {useCreateWallet} from '../../hooks'
import {errorMessages} from '../../i18n/global-messages'
import {useWalletNavigation, WalletInitRoutes} from '../../navigation'
import {COLORS} from '../../theme'
import {NetworkError} from '../../yoroi-wallets/cardano/errors'
import {WalletForm} from '../WalletForm'

export const WalletCredentialsScreen = () => {
  const {resetToWalletSelection} = useWalletNavigation()
  const route = useRoute<RouteProp<WalletInitRoutes, 'wallet-credentials'>>()
  const {phrase, networkId, walletImplementationId} = route.params

  const intl = useIntl()
  const {createWallet, isLoading, isSuccess} = useCreateWallet({
    onSuccess: () => resetToWalletSelection(),
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof NetworkError
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <WalletForm
        onSubmit={
          isLoading || isSuccess
            ? NOOP
            : ({name, password}) =>
                createWallet({name, password, mnemonicPhrase: phrase, networkId, walletImplementationId})
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
