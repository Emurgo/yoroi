import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {ActivityIndicator} from 'react-native'
import {useDispatch} from 'react-redux'

import {createWallet, updateVersion} from '../../../legacy/actions'
import type {WalletInterface} from '../../../legacy/crypto/WalletInterface'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../legacy/RoutesList'
import type {WalletMeta} from '../../../legacy/state'
import assert from '../../../legacy/utils/assert'
import {ignoreConcurrentAsyncHandler} from '../../../legacy/utils/utils'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {WalletForm} from '../WalletForm'

export const WalletCredentialsScreen = () => {
  const navigation = useNavigation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const route: any = useRoute()
  const [waiting, setWaiting] = React.useState(false)
  const dispatch = useDispatch()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const setSelectedWallet = useSetSelectedWallet()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const navigateToWallet = React.useCallback(
    ignoreConcurrentAsyncHandler(
      () =>
        async ({name, password}) => {
          setWaiting(true)
          const {phrase, networkId, walletImplementationId, provider} = route.params
          assert.assert(!!phrase, 'mnemonic')
          assert.assert(networkId != null, 'networkId')
          assert.assert(!!walletImplementationId, 'walletImplementationId')
          try {
            const wallet: WalletInterface = await dispatch(
              createWallet(name, phrase, password, networkId, walletImplementationId, provider),
            )
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
          } finally {
            setWaiting(false)
          }

          navigation.navigate(ROOT_ROUTES.WALLET, {
            screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES,
          })
        },
      1000,
    )(),
    [],
  )

  return (
    <>
      <WalletForm onSubmit={navigateToWallet} />
      {waiting && <ActivityIndicator />}
    </>
  )
}
