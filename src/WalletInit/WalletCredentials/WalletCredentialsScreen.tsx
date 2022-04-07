import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {ActivityIndicator, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch} from 'react-redux'

import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../legacy/RoutesList'
import type {WalletMeta} from '../../../legacy/state'
import {useCreateWallet} from '../../hooks'
import {updateVersion} from '../../legacy/actions'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {WalletForm} from '../WalletForm'

export const WalletCredentialsScreen = () => {
  const navigation = useNavigation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const route: any = useRoute()
  const {phrase, networkId, walletImplementationId, provider} = route.params

  const dispatch = useDispatch()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const setSelectedWallet = useSetSelectedWallet()

  const {createWallet, isLoading, isSuccess} = useCreateWallet({
    onSuccess: async (wallet, {name}) => {
      const walletMeta: WalletMeta = {
        name,

        id: wallet.id,
        networkId: wallet.networkId,
        walletImplementationId: wallet.walletImplementationId,
        isHW: wallet.isHW,
        checksum: wallet.checksum,
        isEasyConfirmationEnabled: wallet.isEasyConfirmationEnabled,
        provider: wallet.provider,
      }
      setSelectedWalletMeta(walletMeta)
      setSelectedWallet(wallet)
      await dispatch(updateVersion())

      navigation.navigate(ROOT_ROUTES.WALLET, {screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES})
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
      {isLoading && <ActivityIndicator color={'black'} />}
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
