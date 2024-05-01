import {useTheme} from '@yoroi/theme'
import React, {useEffect} from 'react'
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native'

import {useSelectedWallet} from '../../features/WalletManager/Context'
import {useAuthOsWithEasyConfirmation} from '../../yoroi-wallets/auth'
import {useSignTx, useSubmitTx} from '../../yoroi-wallets/hooks'
import {YoroiSignedTx, YoroiUnsignedTx} from '../../yoroi-wallets/types'

type Props = {
  onSuccess?: (signedTx: YoroiSignedTx) => void
  unsignedTx: YoroiUnsignedTx
  onError?: () => void
}

export const ConfirmTxWithOsModal = ({onSuccess, unsignedTx, onError}: Props) => {
  const wallet = useSelectedWallet()
  const styles = useStyles()

  const {signTx, error: signError} = useSignTx({wallet})
  const {submitTx} = useSubmitTx({wallet}, {onError})

  const {authWithOs, error: authWithOsError} = useAuthOsWithEasyConfirmation(
    {id: wallet.id},
    {
      onSuccess: (rootKey) => {
        signTx(
          {unsignedTx, rootKey},
          {
            onSuccess: (signedTx) => {
              submitTx(signedTx, {onSuccess: () => onSuccess?.(signedTx)})
            },
          },
        )
      },
    },
  )

  useEffect(() => {
    if (!wallet.isEasyConfirmationEnabled) return
    authWithOs()
  }, [wallet.isEasyConfirmationEnabled, authWithOs])

  const error = signError || authWithOsError

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

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorMessage: {
      color: color.sys_magenta_c500,
      textAlign: 'center',
    },
  })
  return styles
}
