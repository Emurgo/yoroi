// @flow

import {useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {useDispatch} from 'react-redux'

// $FlowExpectedError
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '../../../../src/SelectedWallet'
import {createWalletWithBip44Account} from '../../../actions'
import {saveHW} from '../../../actions/hwWallet'
import image from '../../../assets/img/ledger_2.png'
import {CONFIG} from '../../../config/config'
import type {NetworkId, WalletImplementationId} from '../../../config/types'
import type {HWDeviceInfo} from '../../../crypto/shelley/ledgerUtils'
import type {WalletInterface} from '../../../crypto/WalletInterface'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../RoutesList'
import type {WalletMeta} from '../../../state'
import assert from '../../../utils/assert'
import WalletNameForm from '../WalletNameForm'

export type Params = {
  networkId: NetworkId,
  walletImplementationId: WalletImplementationId,
  hwDeviceInfo: HWDeviceInfo,
}

const SaveNanoXScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const dispatch = useDispatch()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const setSelectedWallet = useSetSelectedWallet()

  const onSubmit = async ({name}) => {
    const {networkId, walletImplementationId, hwDeviceInfo}: Params = (route.params: any)
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

export default SaveNanoXScreen
