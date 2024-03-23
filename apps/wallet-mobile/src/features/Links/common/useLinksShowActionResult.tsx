import {useLinks} from '@yoroi/links'
import * as React from 'react'

export const useLinksShowActionResult = () => {
  const {action} = useLinks()
  const initialRoute = action?.info.useCase === 'order/show-create-result' ? 'exchange-result' : 'wallet-selection'

  return React.useMemo(() => {
    return {initialRoute}
  }, [initialRoute])
}
