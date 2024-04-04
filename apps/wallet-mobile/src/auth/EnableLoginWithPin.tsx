import React from 'react'

import {LoadingOverlay} from '../components/LoadingOverlay'
import {useSelectedWalletContext} from '../features/AddWallet/common/Context'
import {useDisableAllEasyConfirmation} from '../yoroi-wallets/auth'
import {CreatePinScreen} from './CreatePinScreen'

export const EnableLoginWithPin = ({onDone}: {onDone: () => void}) => {
  const [wallet] = useSelectedWalletContext()
  const {disableAllEasyConfirmation, isLoading} = useDisableAllEasyConfirmation(wallet, {
    onSettled: onDone,
  })

  return (
    <>
      <CreatePinScreen onDone={disableAllEasyConfirmation} />

      <LoadingOverlay loading={isLoading} />
    </>
  )
}
