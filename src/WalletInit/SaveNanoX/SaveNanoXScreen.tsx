import {RouteProp, useRoute} from '@react-navigation/native'
import React from 'react'

import image from '../../assets/img/ledger_2.png'
import {useCreateBip44Wallet} from '../../hooks'
import {CONFIG} from '../../legacy/config'
import {useWalletNavigation, WalletInitRoutes} from '../../navigation'
import {WalletNameForm} from '../WalletNameForm'

export const SaveNanoXScreen = () => {
  const {resetToWalletSelection} = useWalletNavigation()
  const route = useRoute<RouteProp<WalletInitRoutes, 'save-nano-x'>>()
  const {networkId, walletImplementationId, hwDeviceInfo} = route.params

  const {createWallet, isLoading} = useCreateBip44Wallet({
    onSuccess: () => {
      resetToWalletSelection()
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
