import {Transaction} from '@emurgo/cross-csl-core'
import * as React from 'react'
import {useMutation} from 'react-query'

import {cip30LedgerExtensionMaker} from '../../../../yoroi-wallets/cardano/cip30/cip30-ledger'
import {BaseLedgerError} from '../../../../yoroi-wallets/hw/hw'
import {useConfirmHWConnectionModal} from '../../../Discover/common/ConfirmHWConnectionModal'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'

export type Options = {
  cbor: string
  partial?: boolean
  onConfirm?: (tx: Transaction) => void
  onCancel?: () => void
  onClose?: () => void
}

export const useSignTxWithHW = () => {
  const {confirmHWConnection, closeModal} = useConfirmHWConnectionModal()
  const {wallet, meta} = useSelectedWallet()

  const mutationFn = React.useCallback(
    (data: {cbor: string; partial?: boolean}, options: Options) => {
      return new Promise<Transaction>((resolve, reject) => {
        confirmHWConnection({
          onConfirm: async ({transportType, deviceInfo}) => {
            try {
              const cip30 = cip30LedgerExtensionMaker(wallet, meta)
              const tx = await cip30.signTx(options.cbor, options.partial ?? false, deviceInfo, transportType === 'USB')
              resolve(tx)
              closeModal()
            } catch (error) {
              if (error instanceof BaseLedgerError) {
                throw error
              }
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
    useErrorBoundary: false,
    mutationKey: ['useSignTxWithHW'],
  })

  const sign = (data: {cbor: string; partial?: boolean}, options: Options) => {
    mutation.mutate(data, options)
  }

  return {...mutation, sign}
}
