import {Wallet} from '@yoroi/types'

import * as React from 'react'

import {UsePromiseOptions, usePromise} from '~/hooks/usePromise'
import {createVotingRegTxFromWallet} from '~/wallets/cardano/transaction-recipes'
import {YoroiWallet} from '~/wallets/cardano/types'

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
