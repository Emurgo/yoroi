import {atoms as a, useTheme} from '@yoroi/theme'
import {UnsignedTransaction} from '@yoroi/tx'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as CSL from '@emurgo/cross-csl-core'
import * as React from 'react'
import {ActivityIndicator, Text, View} from 'react-native'

import {useAuthOsWithEasyConfirmation} from '../../features/Auth/hooks/useAuthOsWithEasyConfirmation'
import {useSignTx} from '../../features/Transactions/hooks/useSignTx'
import {useSubmitTx} from '../../features/Transactions/hooks/useSubmitTx'

type Props = {
  onSuccess?: (signedTx: CSL.Transaction) => void
  unsignedTx: UnsignedTransaction
  onError?: (error: unknown) => void
}

export const ConfirmTxWithOsModal = ({
  onSuccess,
  unsignedTx,
  onError,
}: Props) => {
  const {wallet, meta} = useSelectedWallet()
  const {isDark, palette: p} = useTheme()

  const {signTx, error: signError} = useSignTx({wallet})
  const {submitTx} = useSubmitTx({wallet}, {onError})

  const {authWithOs, error: authWithOsError} = useAuthOsWithEasyConfirmation(
    {walletId: wallet.id},
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

  React.useEffect(() => {
    if (!meta.isEasyConfirmationEnabled) return
    authWithOs()
  }, [meta.isEasyConfirmationEnabled, authWithOs])

  const error = signError || authWithOsError

  if (error) {
    return (
      <View style={[a.align_center, a.justify_center]}>
        <Text
          style={[{color: p.sys_magenta_500}, a.text_center]}
          numberOfLines={3}
        >
          {error.message}
        </Text>
      </View>
    )
  }

  return (
    <View style={[a.align_center, a.justify_center]}>
      <ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />
    </View>
  )
}
