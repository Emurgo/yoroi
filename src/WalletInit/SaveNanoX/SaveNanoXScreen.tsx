import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {useDispatch} from 'react-redux'

import {saveHW} from '../../../legacy/actions/hwWallet'
import image from '../../../legacy/assets/img/ledger_2.png'
import {CONFIG} from '../../../legacy/config/config'
import type {WalletMeta} from '../../../legacy/state'
import {useCreateBip44Wallet} from '../../hooks'
import {WalletInitRoutes} from '../../navigation'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {WalletNameForm} from '../WalletNameForm'

export const SaveNanoXScreen = () => {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<WalletInitRoutes, 'save-nano-x'>>()
  const {networkId, walletImplementationId, hwDeviceInfo} = route.params
  const dispatch = useDispatch()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const setSelectedWallet = useSetSelectedWallet()
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

      navigation.navigate('app-root', {
        screen: 'main-wallet-routes',
        params: {
          screen: 'history',
          params: {
            screen: 'history-list',
          },
        },
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
