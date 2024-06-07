import React from 'react'

import {LoadingOverlay} from '../../components/LoadingOverlay'
import {useWalletManager} from '../WalletManager/context/WalletManagerProvider'
import {useDisableAllEasyConfirmation} from './common/hooks'
import {CreatePinScreen} from './CreatePinScreen'

export const EnableLoginWithPin = ({onDone}: {onDone: () => void}) => {
  const {
    selected: {wallet},
  } = useWalletManager()
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
