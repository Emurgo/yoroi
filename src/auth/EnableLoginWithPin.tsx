import React from 'react'

import {LoadingOverlay} from '../components/LoadingOverlay'
import {useSelectedWalletContext} from '../SelectedWallet'
import {useDisableAllEasyConfirmation} from './authOS'
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
