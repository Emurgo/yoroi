import {isString} from '@yoroi/common'
import {Portfolio} from '@yoroi/types'

import * as React from 'react'

import {
  clearPendingSwapToken,
  getPendingSwapToken,
} from '~/features/Notifications/common/tools'

import {useSwap} from './useSwap'

export const usePendingSwapToken = (tokenIds: Portfolio.Token.Id[]) => {
  const swapForm = useSwap()
  const hasAppliedRef = React.useRef(false)

  React.useEffect(() => {
    if (tokenIds.length === 0 || hasAppliedRef.current) return

    const checkPendingToken = async () => {
      const pendingTokenId = await getPendingSwapToken()
      if (
        pendingTokenId &&
        isString(pendingTokenId) &&
        tokenIds.includes(pendingTokenId)
      ) {
        swapForm.action({type: 'TokenOutIdChanged', value: pendingTokenId})
        swapForm.action({type: 'TokenOutInputTouched'})
        await clearPendingSwapToken()
        hasAppliedRef.current = true
      }
    }

    checkPendingToken()
  }, [tokenIds, swapForm])
}
