import {RouteProp, useRoute} from '@react-navigation/native'
import React from 'react'
import {useIntl} from 'react-intl'
import {ActivityIndicator, InteractionManager, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {showErrorDialog} from '../../dialogs'
import {errorMessages} from '../../i18n/global-messages'
import {useMetrics} from '../../metrics/metricsManager'
import {useWalletNavigation, WalletInitRoutes} from '../../navigation'
import {COLORS} from '../../theme'
import {AddressMode} from '../../wallet-manager/types'
import {NetworkError} from '../../yoroi-wallets/cardano/errors'
import {useCreateWallet} from '../../yoroi-wallets/hooks'
import {WalletForm} from '../WalletForm'

// when restoring, later will be part of the onboarding
const addressMode: AddressMode = 'single'
export const WalletCredentialsScreen = () => {
  const {resetToWalletSelection} = useWalletNavigation()
  const {track} = useMetrics()
  const route = useRoute<RouteProp<WalletInitRoutes, 'wallet-credentials'>>()
  const {phrase, networkId, walletImplementationId} = route.params

  const intl = useIntl()
  const {createWallet, isLoading, isSuccess} = useCreateWallet({
    onSuccess: () => {
      track.restoreWalletDetailsSettled()
      resetToWalletSelection()
    },
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
                createWallet({name, password, mnemonicPhrase: phrase, networkId, walletImplementationId, addressMode})
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
