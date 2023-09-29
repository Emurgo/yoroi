import React, {useEffect, useState} from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../components'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {useAuthOsWithEasyConfirmation} from '../../../../yoroi-wallets/auth'
import {ConfirmWithSpendingPassword} from '../ConfirmWithSpendingPassword'

export const ConfirmPasswordWalletRawTx = ({onConfirm}: {onConfirm: (rootKey: string) => Promise<void>}) => {
  const wallet = useSelectedWallet()
  const {authWithOs, isLoading} = useAuthOsWithEasyConfirmation(
    {id: wallet.id},
    {onSuccess: (rootKey) => onConfirm(rootKey)},
  )

  const handlePasswordConfirm = async (password: string) => {
    const rootKey = await wallet.encryptedStorage.rootKey.read(password)
    return onConfirm(rootKey)
  }

  useEffect(() => {
    if (!wallet.isEasyConfirmationEnabled) return
    authWithOs()
  }, [wallet.isEasyConfirmationEnabled, authWithOs])

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="black" />
      </View>
    )
  }

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

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
