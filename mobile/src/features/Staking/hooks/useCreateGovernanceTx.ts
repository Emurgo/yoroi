import {Wallet} from '@yoroi/types'

import {Certificate} from '@emurgo/cross-csl-core'
import * as React from 'react'

import {useNavigateTo} from '~/features/Staking/Governance/common/navigation'
import {isInsufficientBalanceError} from '~/features/Staking/Governance/common/transactionErrorHandling'
import {UsePromiseOptions, usePromise} from '~/common/hooks/usePromise'
import {createUnsignedGovernanceTxFromWallet} from '@yoroi/cardano-wallet/transaction-recipes'
import {YoroiWallet} from '@yoroi/cardano-wallet/types'

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
  const navigateTo = useNavigateTo()
  const {onError: optionsOnError, ...restOptions} = options ?? {}

  const create = React.useCallback(
    async ({
      certificates,
      addressMode,
    }: {
      certificates: Certificate[]
      addressMode: Wallet.AddressMode
    }) => {
      return createUnsignedGovernanceTxFromWallet(wallet, {
        votingCertificates: certificates,
        addressMode,
      })
    },
    [wallet],
  )

  const handleError = React.useCallback(
    (error: Error) => {
      // Check for insufficient balance errors and navigate to noFunds screen
      if (isInsufficientBalanceError(error)) {
        navigateTo.noFunds()
        return
      }

      // Call original error handler if provided
      optionsOnError?.(error)
    },
    [navigateTo, optionsOnError],
  )

  const promise = usePromise({
    promise: create,
    ...restOptions,
    onError: handleError,
  })

  return {
    createUnsignedGovernanceTx: promise.resolve,
    ...promise,
  }
}
