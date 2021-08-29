// @flow

import React from 'react'
import {useDispatch} from 'react-redux'
import {useNavigation, useRoute} from '@react-navigation/native'

import WalletNameForm from '../WalletNameForm'
import {createWalletWithBip44Account} from '../../../actions'
import {saveHW} from '../../../actions/hwWallet'
import {WALLET_ROOT_ROUTES, ROOT_ROUTES} from '../../../RoutesList'
import {CONFIG} from '../../../config/config'
import assert from '../../../utils/assert'
import image from '../../../assets/img/ledger_2.png'

import type {WalletImplementationId, NetworkId} from '../../../config/types'
import type {HWDeviceInfo} from '../../../crypto/shelley/ledgerUtils'

export type Params = {
  networkId: NetworkId,
  walletImplementationId: WalletImplementationId,
  hwDeviceInfo: HWDeviceInfo,
}

const SaveNanoXScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const dispatch = useDispatch()

  const onSubmit = async ({name}) => {
    const {networkId, walletImplementationId, hwDeviceInfo}: Params = (route.params: any)
    assert.assert(hwDeviceInfo != null, 'SaveNanoXScreen::onPress hwDeviceInfo')

    await dispatch(
      createWalletWithBip44Account(
        name,
        hwDeviceInfo.bip44AccountPublic,
        networkId,
        walletImplementationId,
        hwDeviceInfo,
        false,
      ),
    )
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
