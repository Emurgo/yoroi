import {createUtxoConsolidationTxFromWallet} from '@yoroi/cardano-wallet/transaction-recipes'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

import {useMutation} from '@tanstack/react-query'
import {Alert} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'

export const useUtxoConsolidation = () => {
  const {wallet, meta} = useSelectedWallet()
  const strings = useStrings()

  const mutation = useMutation({
    mutationFn: async (): Promise<{cbor: string}> => {
      if (!wallet) {
        throw new Error('Wallet not available')
      }

      return await createUtxoConsolidationTxFromWallet(wallet, {
        addressMode: meta.addressMode,
      })
    },
    onError: (error) => {
      logger.error('UTXO consolidation failed', {error})
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      Alert.alert(strings.global.error, errorMessage || strings.global.error)
    },
  })

  return {
    consolidateUtxos: mutation.mutate,
    isConsolidating: mutation.isPending,
    ...mutation,
  }
}
