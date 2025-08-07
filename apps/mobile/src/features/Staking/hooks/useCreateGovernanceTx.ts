import {Wallet} from '@yoroi/types'

import {Certificate} from '@emurgo/cross-csl-core'
import * as React from 'react'

import {UsePromiseOptions, usePromise} from '~/hooks/usePromise'
import {YoroiWallet} from '~/wallets/cardano/types'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'

export const useCreateGovernanceTx = (
  wallet: YoroiWallet,
  options?: UsePromiseOptions<
    YoroiUnsignedTx,
    [{certificates: Certificate[]; addressMode: Wallet.AddressMode}]
  >,
) => {
  const create = React.useCallback(
    async ({
      certificates,
      addressMode,
    }: {
      certificates: Certificate[]
      addressMode: Wallet.AddressMode
    }) => {
      return await wallet.createUnsignedGovernanceTx({
        votingCertificates: certificates,
        addressMode,
      })
    },
    [wallet],
  )

  const promise = usePromise({
    promise: create,
    ...options,
  })

  return {
    createUnsignedGovernanceTx: promise.resolve,
    ...promise,
  }
}
