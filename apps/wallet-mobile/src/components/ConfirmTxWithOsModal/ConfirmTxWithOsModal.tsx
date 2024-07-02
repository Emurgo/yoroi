import {useTheme} from '@yoroi/theme'
import React, {useEffect} from 'react'
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native'

import {useAuthOsWithEasyConfirmation} from '../../features/Auth/common/hooks'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import {useSignTx, useSubmitTx} from '../../yoroi-wallets/hooks'
import {YoroiSignedTx, YoroiUnsignedTx} from '../../yoroi-wallets/types'

type Props = {
  onSuccess?: (signedTx: YoroiSignedTx) => void
  unsignedTx: YoroiUnsignedTx
  onError?: () => void
}

export const ConfirmTxWithOsModal = ({onSuccess, unsignedTx, onError}: Props) => {
  const {wallet, meta} = useSelectedWallet()
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
    if (!meta.isEasyConfirmationEnabled) return
    authWithOs()
  }, [meta.isEasyConfirmationEnabled, authWithOs])

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
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    center: {
      alignItems: 'center',
      justifyContent: 'center',
      ...atoms.px_lg,
    },
    errorMessage: {
      color: color.sys_magenta_c500,
      textAlign: 'center',
    },
  })
  return styles
}
