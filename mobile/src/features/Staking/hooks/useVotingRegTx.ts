import {createVotingRegTxFromWallet} from '@yoroi/cardano-wallet/transaction-recipes'
import {YoroiWallet} from '@yoroi/cardano-wallet/types'
import {Wallet} from '@yoroi/types'

import * as React from 'react'

import {UsePromiseOptions, usePromise} from '~/common/hooks/usePromise'

type VotingRegTxAndEncryptedKey = {
  votingRegTx: {cbor: string}
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
  const createVotingRegTxHelper = React.useCallback(
    async ({
      catalystKeyHex,
      supportsCIP36,
      addressMode,
    }: {
      catalystKeyHex: string
      supportsCIP36: boolean
      addressMode: Wallet.AddressMode
    }) => {
      return await createVotingRegTxFromWallet(wallet, {
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
    promise: createVotingRegTxHelper,
  })

  return {
    ...promise,
    createVotingRegTx: promise.resolve,
  }
}
