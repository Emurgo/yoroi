import {useLinks} from '@yoroi/links'

import * as React from 'react'

export const useLinksShowActionResult = () => {
  const {pendingAction} = useLinks()
  const initialRoute = React.useMemo(() => {
    if (
      pendingAction?.source === 'yoroi' &&
      pendingAction.action.info.useCase === 'order/show-create-result'
    ) {
      return 'exchange-result'
    }
    return 'wallet-selection'
  }, [pendingAction])

  return initialRoute
}
