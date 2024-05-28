import * as React from 'react'

import {useWalletNavigation} from '../../../kernel/navigation'

export const useNavigateTo = () => {
  const walletNavigation = useWalletNavigation()

  return React.useRef({
    startTransfer: () => walletNavigation.navigateToStartTransfer(),
  } as const).current
}
