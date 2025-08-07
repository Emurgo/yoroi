import * as React from 'react'

import {UsePromiseOptions, usePromise} from '~/hooks/usePromise'
import {YoroiWallet} from '~/wallets/cardano/types'

export const useSaveMemo = (
  {wallet}: {wallet: YoroiWallet},
  options?: UsePromiseOptions<void, [{txId: string; memo: string}]>,
) => {
  const save = React.useCallback(
    async ({txId, memo}: {txId: string; memo: string}) => {
      return await wallet.saveMemo(txId, memo)
    },
    [wallet],
  )

  const promise = usePromise({
    promise: save,
    ...options,
  })

  return {
    saveMemo: promise.resolve,
    ...promise,
  }
}
