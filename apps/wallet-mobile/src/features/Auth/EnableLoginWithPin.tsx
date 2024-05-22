import React from 'react'

import {LoadingOverlay} from '../../components/LoadingOverlay'
import {useDisableAllEasyConfirmation} from '../../yoroi-wallets/auth'
import {useSelectedWalletContext} from '../WalletManager/context/SelectedWalletContext'
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
