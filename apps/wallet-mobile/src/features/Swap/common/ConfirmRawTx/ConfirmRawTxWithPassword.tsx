import React, {useState} from 'react'

import {Spacer} from '../../../../components'
import {useSelectedWallet} from '../../../WalletManager/Context/SelectedWalletContext'
import {ConfirmWithSpendingPassword} from '../ConfirmWithSpendingPassword'

export const ConfirmRawTxWithPassword = ({onConfirm}: {onConfirm?: (rootKey: string) => Promise<void>}) => {
  const wallet = useSelectedWallet()

  const handlePasswordConfirm = async (password: string) => {
    const rootKey = await wallet.encryptedStorage.rootKey.read(password)
    return onConfirm?.(rootKey)
  }

  return <PasswordInput onConfirm={handlePasswordConfirm} />
}

const PasswordInput = ({onConfirm}: {onConfirm: (password: string) => Promise<void>}) => {
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const onConfirmPress = async (password: string) => {
    setError(null)
    setLoading(true)
    try {
      await onConfirm(password)
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e)
      }
    }
    setLoading(false)
  }

  const handlePasswordChange = () => {
    setError(null)
  }

  return (
    <>
      <ConfirmWithSpendingPassword
        onSubmit={onConfirmPress}
        onPasswordChange={handlePasswordChange}
        isLoading={loading}
        error={error ?? undefined}
      />

      <Spacer height={10} />
    </>
  )
}
