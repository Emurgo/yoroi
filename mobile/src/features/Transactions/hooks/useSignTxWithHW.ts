import {HW} from '@yoroi/types'

import {UseMutationOptions, useMutation} from '@tanstack/react-query'

import {YoroiWallet} from '~/wallets/cardano/types'
import {YoroiSignedTx, YoroiUnsignedTx} from '~/wallets/types/yoroi'

export const useSignTxWithHW = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<
    YoroiSignedTx,
    Error,
    {unsignedTx: YoroiUnsignedTx; useUSB: boolean; hwDeviceInfo: HW.DeviceInfo}
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
