import {App} from '@yoroi/types'
import {freeze} from 'immer'
import * as React from 'react'

import {throwLoggedError} from '../../../../kernel/logger/helpers/throw-logged-error'
import {useWalletManager} from '../../context/WalletManagerProvider'

export const useSelectedWallet = () => {
  const {
    selected: {wallet, meta},
  } = useWalletManager()

  return React.useMemo(() => {
    if (!wallet || !meta)
      throwLoggedError(
        new App.Errors.InvalidState('useSelectedWallet wallet/meta is not set when expected, invalid state reached'),
      )

    return freeze({wallet, meta})
  }, [meta, wallet])
}
