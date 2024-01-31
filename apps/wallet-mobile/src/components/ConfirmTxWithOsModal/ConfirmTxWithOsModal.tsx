import React, {useEffect} from 'react'
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native'

import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
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

  const {signTx, error: signError} = useSignTx({wallet})
  const {submitTx, error: submitError} = useSubmitTx({wallet}, {onError})

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

  const error = signError || submitError || authWithOsError

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
