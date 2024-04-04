import {useTheme} from '@yoroi/theme'
import React, {useEffect} from 'react'
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native'

import {useAuthOsWithEasyConfirmation} from '../../../../yoroi-wallets/auth'
import {useSelectedWallet} from '../../../AddWallet/common/Context'
import {getErrorMessage} from '../errors'
import {useStrings} from '../strings'

export const ConfirmRawTxWithOs = ({onConfirm}: {onConfirm?: (rootKey: string) => Promise<void>}) => {
  const wallet = useSelectedWallet()
  const strings = useStrings()
  const styles = useStyles()

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

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme

  const styles = StyleSheet.create({
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorMessage: {
      color: color.magenta[500],
      textAlign: 'center',
    },
  })

  return styles
}
