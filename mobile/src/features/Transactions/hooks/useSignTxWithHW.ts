import {YoroiWallet} from '@yoroi/cardano-wallet'
import {UnsignedTransaction} from '@yoroi/tx'
import {HW} from '@yoroi/types'

import * as CSL from '@emurgo/cross-csl-core'
import {UseMutationOptions, useMutation} from '@tanstack/react-query'

export const useSignTxWithHW = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<
    CSL.Transaction,
    Error,
    {
      unsignedTx: UnsignedTransaction
      useUSB: boolean
      hwDeviceInfo: HW.DeviceInfo
    }
  > = {},
) => {
  const mutation = useMutation({
    mutationFn: async ({unsignedTx, useUSB, hwDeviceInfo}) =>
      wallet.signTxWithLedger(unsignedTx, useUSB, hwDeviceInfo),
    retry: false,
    ...options,
  })

  return {
    signTx: mutation.mutate,
    ...mutation,
  }
}
