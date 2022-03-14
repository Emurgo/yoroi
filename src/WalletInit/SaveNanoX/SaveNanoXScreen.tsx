import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {useDispatch} from 'react-redux'

import {createWalletWithBip44Account} from '../../../legacy/actions'
import {saveHW} from '../../../legacy/actions/hwWallet'
import image from '../../../legacy/assets/img/ledger_2.png'
import {CONFIG} from '../../../legacy/config/config'
import type {HWDeviceInfo} from '../../../legacy/crypto/shelley/ledgerUtils'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../legacy/RoutesList'
import type {WalletMeta} from '../../../legacy/state'
import assert from '../../../legacy/utils/assert'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {NetworkId, WalletImplementationId, WalletInterface} from '../../types'
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

  const onSubmit = async ({name}) => {
    const {networkId, walletImplementationId, hwDeviceInfo} = route.params as Params
    assert.assert(hwDeviceInfo != null, 'SaveNanoXScreen::onPress hwDeviceInfo')

    const wallet: WalletInterface = await dispatch(
      createWalletWithBip44Account(
        name,
        hwDeviceInfo.bip44AccountPublic,
        networkId,
        walletImplementationId,
        hwDeviceInfo,
        false,
      ),
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
    dispatch(saveHW(hwDeviceInfo))
    navigation.navigate(ROOT_ROUTES.WALLET, {
      screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES,
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
    />
  )
}
