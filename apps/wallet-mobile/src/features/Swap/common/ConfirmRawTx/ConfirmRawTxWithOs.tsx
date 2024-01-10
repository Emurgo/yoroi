import React, {useEffect} from 'react'
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native'

import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {useAuthOsWithEasyConfirmation} from '../../../../yoroi-wallets/auth'
import {getErrorMessage} from '../errors'
import {useStrings} from '../strings'

export const ConfirmRawTxWithOs = ({onConfirm}: {onConfirm?: (rootKey: string) => Promise<void>}) => {
  const wallet = useSelectedWallet()
  const strings = useStrings()

  const {authWithOs, error} = useAuthOsWithEasyConfirmation(
    {id: wallet.id},
    {onSuccess: (rootKey) => onConfirm?.(rootKey)},
  )

  useEffect(() => {
    if (!wallet.isEasyConfirmationEnabled) return
    authWithOs()
  }, [wallet.isEasyConfirmationEnabled, authWithOs])

  const errorMessage = error ? getErrorMessage(error, strings) : null

  if (errorMessage != null) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorMessage} numberOfLines={3}>
          {errorMessage}
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
