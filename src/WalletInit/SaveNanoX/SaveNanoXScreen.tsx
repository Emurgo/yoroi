import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {useDispatch} from 'react-redux'

import {saveHW} from '../../../legacy/actions/hwWallet'
import image from '../../../legacy/assets/img/ledger_2.png'
import {CONFIG} from '../../../legacy/config/config'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../legacy/RoutesList'
import type {WalletMeta} from '../../../legacy/state'
import {useCreateBip44Wallet} from '../../hooks'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {HWDeviceInfo, NetworkId, WalletImplementationId} from '../../types'
import {WalletNameForm} from '../WalletNameForm'

export type Params = {
  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  hwDeviceInfo: HWDeviceInfo
}

export const SaveNanoXScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const {networkId, walletImplementationId, hwDeviceInfo} = route.params as Params
  const dispatch = useDispatch()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const setSelectedWallet = useSetSelectedWallet()
  const {createWallet, isLoading} = useCreateBip44Wallet({
    onSuccess: (wallet, {name}) => {
      const {hwDeviceInfo} = route.params as Params
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
      dispatch(saveHW(hwDeviceInfo))

      navigation.navigate(ROOT_ROUTES.WALLET, {
        screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES,
      })
    },
  })

  return (
    <WalletNameForm
      onSubmit={({name}) =>
        createWallet({
          name,
          networkId,
          bip44AccountPublic: hwDeviceInfo.bip44AccountPublic,
          implementationId: walletImplementationId,
          hwDeviceInfo,
          readOnly: false,
        })
      }
      defaultWalletName={CONFIG.HARDWARE_WALLETS.LEDGER_NANO.DEFAULT_WALLET_NAME}
      image={image}
      progress={{
        currentStep: 3,
        totalSteps: 3,
      }}
      isWaiting={isLoading}
    />
  )
}
