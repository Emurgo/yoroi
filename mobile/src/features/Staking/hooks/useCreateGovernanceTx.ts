import {Wallet} from '@yoroi/types'

import {Certificate} from '@emurgo/cross-csl-core'
import * as React from 'react'

import {UsePromiseOptions, usePromise} from '~/hooks/usePromise'
import {YoroiWallet} from '~/wallets/cardano/types'

export const useCreateGovernanceTx = (
  wallet: YoroiWallet,
  options?: Omit<
    UsePromiseOptions<
      {cbor: string},
      [{certificates: Certificate[]; addressMode: Wallet.AddressMode}]
    >,
    'promise'
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
