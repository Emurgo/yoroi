import {Wallet} from '@yoroi/types'

import * as React from 'react'

import {UsePromiseOptions, usePromise} from '~/hooks/usePromise'
import {YoroiWallet} from '~/wallets/cardano/types'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'

type VotingRegTxAndEncryptedKey = {
  votingRegTx: YoroiUnsignedTx
}

export const useVotingRegTx = (
  {
    wallet,
  }: {
    wallet: YoroiWallet
  },
  options?: UsePromiseOptions<
    VotingRegTxAndEncryptedKey,
    [
      {
        catalystKeyHex: string
        supportsCIP36: boolean
        addressMode: Wallet.AddressMode
      },
    ]
  >,
) => {
  const createVotingRegTx = React.useCallback(
    async ({
      catalystKeyHex,
      supportsCIP36,
      addressMode,
    }: {
      catalystKeyHex: string
      supportsCIP36: boolean
      addressMode: Wallet.AddressMode
    }) => {
      return await wallet.createVotingRegTx({
        catalystKeyHex,
        supportsCIP36,
        addressMode,
      })
    },
    [wallet],
  )

  const promise = usePromise({
    shouldThrow: true,
    ...options,
    promise: createVotingRegTx,
  })

  return {
    ...promise,
    createVotingRegTx: promise.resolve,
  }
}
