import {BaseLedgerError, cip30LedgerExtensionMaker} from '@yoroi/cardano-wallet'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {Transaction} from '@emurgo/cross-csl-core'
import {useMutation} from '@tanstack/react-query'
import * as React from 'react'

import {useConfirmHWConnectionModal} from '~/features/Discover/common/ConfirmHWConnectionModal'
import {logger} from '~/kernel/logger/logger'

export type SignTxWithHW = {
  cbor: string
  partial?: boolean
  onCancel?: () => void
  onClose?: () => void
  onSuccess?: (tx: Transaction) => void
  onError?: (error: unknown) => void
}

export const useSignTxWithHW = () => {
  const {confirmHWConnection, closeModal} = useConfirmHWConnectionModal()
  const {wallet, meta} = useSelectedWallet()

  const mutationFn = React.useCallback(
    (options: SignTxWithHW) => {
      return new Promise<Transaction>((resolve, reject) => {
        confirmHWConnection({
          onConfirm: async ({transportType, deviceInfo}) => {
            try {
              const cip30 = cip30LedgerExtensionMaker(wallet, meta, {
                toLedgerSignRequest: wallet._dependencies.toLedgerSignRequest,
              })

              const tx = await cip30.signTx(
                options.cbor,
                options.partial ?? false,
                deviceInfo,
                transportType === 'USB',
              )

              resolve(tx)
              if (options.onSuccess) options.onSuccess(tx)
              closeModal()
            } catch (error) {
              logger.error('useSignTxWithHW: Failed to sign transaction', {
                walletId: wallet?.id,
                error: error instanceof Error ? error.message : String(error),
                isBaseLedgerError: error instanceof BaseLedgerError,
              })

              if (error instanceof BaseLedgerError) {
                throw error
              }
              if (options.onError) options.onError(error)
              reject(error)
              closeModal()
            }
          },
          onCancel: options.onCancel,
          onClose: options.onClose,
        })
      })
    },
    [confirmHWConnection, wallet, meta, closeModal],
  )

  const mutation = useMutation({
    mutationFn,
    throwOnError: false,
    mutationKey: ['useSignTxWithHW'],
  })

  const sign = (options: SignTxWithHW) => {
    mutation.mutate(options)
  }

  return {...mutation, sign}
}
