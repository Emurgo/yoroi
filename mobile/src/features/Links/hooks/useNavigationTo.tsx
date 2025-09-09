import * as React from 'react'

import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'

export const useNavigateTo = () => {
  const walletNavigation = useWalletNavigation()

  return React.useRef({
    startTransfer: () => walletNavigation.navigateToStartTransfer(),
    launchDappUrl: () => walletNavigation.navigateToDiscoverBrowserDapp(),
  } as const).current
}
