import React, {useState} from 'react'
import {Keyboard} from 'react-native'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'

import {ConfirmWithSpendingPassword} from '../ConfirmWithSpendingPassword'

type Props = {
  onConfirm?: (rootKey: string) => void
  onError?: () => void
  summary?: string
}

export const ConfirmRawTxWithPassword = ({
  onConfirm,
  onError,
  summary,
}: Props) => {
  const {wallet} = useSelectedWallet()

  const handlePasswordConfirm = async (password: string) => {
    const rootKey = await wallet.encryptedStorage.xpriv.read(password)
    return onConfirm?.(rootKey.value)
  }

  return (
    <PasswordInput
      onConfirm={handlePasswordConfirm}
      onError={onError}
      summary={summary}
    />
  )
}

const PasswordInput = ({
  onConfirm,
  onError,
  summary,
}: {
  onConfirm: (password: string) => void | Promise<void>
  onError?: () => void
  summary?: string
}) => {
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const onConfirmPress = async (password: string) => {
    setError(null)
    setLoading(true)
    // Dismiss keyboard before submitting
    Keyboard.dismiss()
    try {
      await onConfirm(password)
      // Modal should close after onConfirm completes
      // Reset loading state immediately to hide spinner
      setLoading(false)
    } catch (e: unknown) {
      setLoading(false)
      if (onError) {
        onError()
        return
      }

      if (e instanceof Error) {
        setError(e)
      }
    }
  }

  const handlePasswordChange = () => {
    setError(null)
  }

  return (
    <ConfirmWithSpendingPassword
      onSubmit={onConfirmPress}
      onPasswordChange={handlePasswordChange}
      isLoading={loading}
      error={error ?? undefined}
      summary={summary}
    />
  )
}
