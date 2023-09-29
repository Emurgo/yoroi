import React, {useEffect, useState} from 'react'
import {ConfirmWithSpendingPassword} from '../ConfirmWithSpendingPassword'
import {Spacer} from '../../../../components'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {useAuthOsWithEasyConfirmation} from '../../../../yoroi-wallets/auth'

export const ConfirmPasswordWalletRawTx = ({onConfirm}: {onConfirm: (rootKey: string) => Promise<void>}) => {
  const wallet = useSelectedWallet()
  const {authWithOs} = useAuthOsWithEasyConfirmation({id: wallet.id}, {onSuccess: (rootKey) => onConfirm(rootKey)})

  const handlePasswordConfirm = async (password: string) => {
    const rootKey = await wallet.encryptedStorage.rootKey.read(password)
    return onConfirm(rootKey)
  }

  useEffect(() => {
    authWithOs()
  }, [wallet.isEasyConfirmationEnabled])

  return <PasswordModalContent onConfirm={handlePasswordConfirm} />
}

const PasswordModalContent = ({onConfirm}: {onConfirm: (password: string) => Promise<void>}) => {
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

  return (
    <>
      <ConfirmWithSpendingPassword onSubmit={onConfirmPress} isLoading={loading} error={error ?? undefined} />

      <Spacer height={10} />
    </>
  )
}
