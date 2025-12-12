import {createUnsignedGovernanceTxFromWallet} from '@yoroi/cardano-wallet'
import {YoroiWallet} from '@yoroi/cardano-wallet'
import {Wallet} from '@yoroi/types'

import {Certificate} from '@emurgo/cross-csl-core'
import * as React from 'react'

import {UsePromiseOptions, usePromise} from '~/common/hooks/usePromise'
import {useNavigateTo} from '~/features/Staking/Governance/common/navigation'
import {isInsufficientBalanceError} from '~/features/Staking/Governance/common/transactionErrorHandling'

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
