import * as React from 'react'

import {UsePromiseOptions, usePromise} from '~/hooks/usePromise'
import {YoroiWallet} from '~/wallets/cardano/types'

export const useResync = (wallet: YoroiWallet, options?: UsePromiseOptions) => {
  const resync = React.useCallback(async () => {
    return await wallet.resync()
  }, [wallet])

  const promise = usePromise({
    ...options,
    promise: resync,
  })

  return {
    ...promise,
    resync: promise.resolve,
  }
}
