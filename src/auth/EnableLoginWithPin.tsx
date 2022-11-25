import React from 'react'

import {LoadingOverlay} from '../components/LoadingOverlay'
import {useSelectedWalletContext} from '../SelectedWallet'
import {CreatePinScreen} from './CreatePinScreen'
import {useDisableAllEasyConfirmation} from './hooks'

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
