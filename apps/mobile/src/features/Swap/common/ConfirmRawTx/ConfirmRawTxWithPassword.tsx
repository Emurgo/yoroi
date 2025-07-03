import React, {useState} from 'react'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
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
    return onConfirm?.(rootKey)
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
  onConfirm: (password: string) => void
  onError?: () => void
  summary?: string
}) => {
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  const onConfirmPress = (password: string) => {
    setError(null)
    setLoading(true)
    try {
      onConfirm(password)
    } catch (e: unknown) {
      if (onError) {
        setLoading(false)
        onError()
        return
      }

      if (e instanceof Error) {
        setLoading(false)
        setError(e)
      }
    }
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
        summary={summary}
      />

      <Spacer height={10} />
    </>
  )
}
