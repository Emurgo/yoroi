import React, {useState} from 'react'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {ConfirmWithSpendingPassword} from '../ConfirmWithSpendingPassword'

type Props = {
  onConfirm?: (rootKey: string) => Promise<void>
  summary?: string
}

export const ConfirmRawTxWithPassword = ({onConfirm, summary}: Props) => {
  const {wallet} = useSelectedWallet()

  const handlePasswordConfirm = async (password: string) => {
    const rootKey = await wallet.encryptedStorage.xpriv.read(password)
    return onConfirm?.(rootKey)
  }

  return <PasswordInput onConfirm={handlePasswordConfirm} summary={summary} />
}

const PasswordInput = ({onConfirm, summary}: {onConfirm: (password: string) => Promise<void>; summary?: string}) => {
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
        summary={summary}
      />

      <Spacer height={10} />
    </>
  )
}
