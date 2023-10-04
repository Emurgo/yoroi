import React, {useEffect} from 'react'
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native'

import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useAuthOsWithEasyConfirmation} from '../../../../yoroi-wallets/auth'

export const ConfirmRawTxWithOs = ({onConfirm}: {onConfirm?: (rootKey: string) => Promise<void>}) => {
  const wallet = useSelectedWallet()

  const {authWithOs, error} = useAuthOsWithEasyConfirmation(
    {id: wallet.id},
    {onSuccess: (rootKey) => onConfirm?.(rootKey)},
  )

  useEffect(() => {
    if (!wallet.isEasyConfirmationEnabled) return
    authWithOs()
  }, [wallet.isEasyConfirmationEnabled, authWithOs])

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorMessage} numberOfLines={3}>
          {error.message}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="black" />
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMessage: {
    color: COLORS.ERROR_TEXT_COLOR,
    textAlign: 'center',
  },
})
