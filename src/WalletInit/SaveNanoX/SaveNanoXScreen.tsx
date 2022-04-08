import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {useDispatch} from 'react-redux'

import image from '../../../legacy/assets/img/ledger_2.png'
import {CONFIG} from '../../../legacy/config/config'
import type {WalletMeta} from '../../../legacy/state'
import {useCreateBip44Wallet} from '../../hooks'
import {saveHW} from '../../legacy/hwWallet'
import type {HWDeviceInfo} from '../../legacy/ledgerUtils'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {NetworkId, WalletImplementationId} from '../../yoroi-wallets'
import {WalletNameForm} from '../WalletNameForm'

export type Params = {
  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  hwDeviceInfo: HWDeviceInfo
}

export const SaveNanoXScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const dispatch = useDispatch()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const setSelectedWallet = useSetSelectedWallet()
  const {networkId, walletImplementationId, hwDeviceInfo} = route.params as Params
  const {createWallet, isLoading} = useCreateBip44Wallet({
    onSuccess: (wallet, {name}) => {
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

  const onSubmit = async ({name}) => {
    createWallet({
      name,
      bip44AccountPublic: hwDeviceInfo.bip44AccountPublic,
      networkId,
      implementationId: walletImplementationId,
      hwDeviceInfo,
      readOnly: false,
    })
  }

  return (
    <WalletNameForm
      onSubmit={onSubmit}
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
