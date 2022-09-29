import React from 'react'

import {LoadingOverlay} from '../components/LoadingOverlay'
import {useDisableAllEasyConfirmation} from '../hooks'
import {useSelectedWalletContext} from '../SelectedWallet'
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
