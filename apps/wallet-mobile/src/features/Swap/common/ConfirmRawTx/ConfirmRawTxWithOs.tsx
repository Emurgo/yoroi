import {useTheme} from '@yoroi/theme'
import React, {useEffect} from 'react'
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native'

import {useAuthOsWithEasyConfirmation} from '../../../Auth/common/hooks'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {getErrorMessage} from '../errors'
import {useStrings} from '../strings'

export const ConfirmRawTxWithOs = ({onConfirm}: {onConfirm?: (rootKey: string) => Promise<void>}) => {
  const {wallet, meta} = useSelectedWallet()
  const strings = useStrings()
  const styles = useStyles()

  const {authWithOs, error} = useAuthOsWithEasyConfirmation(
    {id: wallet.id},
    {onSuccess: (rootKey) => onConfirm?.(rootKey)},
  )

  useEffect(() => {
    if (!meta.isEasyConfirmationEnabled) return
    authWithOs()
  }, [meta.isEasyConfirmationEnabled, authWithOs])

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
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    center: {
      alignItems: 'center',
      justifyContent: 'center',
      ...atoms.px_lg,
    },
    errorMessage: {
      color: color.sys_magenta_500,
      textAlign: 'center',
    },
  })

  return styles
}
