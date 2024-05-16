import * as React from 'react'

import {useWalletNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const walletNavigation = useWalletNavigation()

  return React.useRef({
    startTransfer: () => walletNavigation.navigateToStartTransfer(),
  } as const).current
}
