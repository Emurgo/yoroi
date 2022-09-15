import React from 'react'

import {LoadingOverlay} from '../components/LoadingOverlay'
import {useDisableAllEasyConfirmation} from '../hooks'
import {useSelectedWalletContext} from '../SelectedWallet'
import {useStorage} from '../Storage'
import {useSaveAuthMethod} from './authOS'
import {CreatePinScreen} from './CreatePinScreen'

export const LinkAuthWithPin = ({onDone}: {onDone: () => void}) => {
  const storage = useStorage()
  const [wallet] = useSelectedWalletContext()
  const {disableAllEasyConfirmation, isLoading: disablingEasyConfirmation} = useDisableAllEasyConfirmation(wallet, {
    onSettled: () => saveAuthMethod('pin'),
  })
  const {saveAuthMethod, isLoading: settingAuthMethod} = useSaveAuthMethod(storage, {
    onSuccess: onDone,
  })

  return (
    <>
      <CreatePinScreen onDone={disableAllEasyConfirmation} />
      <LoadingOverlay loading={disablingEasyConfirmation || settingAuthMethod} />
    </>
  )
}
