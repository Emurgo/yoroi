import {atoms as a, useTheme} from '@yoroi/theme'
import React, {useEffect} from 'react'
import {Text, View} from 'react-native'

import {useAuthOsWithEasyConfirmation} from '~/features/Auth/hooks/useAuthOsWithEasyConfirmation'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {getErrorMessage} from '../errors'
import {useStrings} from '../strings'
import {ActivityIndicator} from './ActivityIndicator'

export const ConfirmRawTxWithOs = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (rootKey: string) => void
  onError?: (error: unknown) => void
}) => {
  const {wallet, meta} = useSelectedWallet()
  const strings = useStrings()
  const {palette: p} = useTheme()

  const {authWithOs, error} = useAuthOsWithEasyConfirmation(
    {id: wallet.id},
    {onSuccess: (rootKey) => onSuccess?.(rootKey)},
  )

  useEffect(() => {
    if (!meta.isEasyConfirmationEnabled) return
    authWithOs()
  }, [meta.isEasyConfirmationEnabled, authWithOs])

  const errorMessage = error ? getErrorMessage(error, strings) : null

  if (errorMessage != null) {
    if (onError) {
      onError(errorMessage)
      return
    }

    return (
      <View style={[a.align_center, a.justify_center, a.px_lg]}>
        <Text
          style={[{color: p.sys_magenta_500, textAlign: 'center'}]}
          numberOfLines={3}
        >
          {errorMessage}
        </Text>
      </View>
    )
  }

  return (
    <View style={[a.align_center, a.justify_center, a.px_lg]}>
      <ActivityIndicator />
    </View>
  )
}
