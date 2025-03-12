import {shouldShowDRep2UsOnTxHistory, useBanner} from '@yoroi/banners'
import {Banners} from '@yoroi/types'
import * as React from 'react'

import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {DelegateToYoroiDRepBanner} from '../common/DelegateToYoroiDRepBanner/DelegateToYoroiDRepBanner'

export const ConsiderDRepToUsTxHistoryBanner = () => {
  const {
    wallet: {bannersManager: manager},
  } = useSelectedWallet()
  const {dismiss, dismissedAt} = useBanner({id: Banners.Id.DRep2UsTxHistory, manager})

  const isVisible = shouldShowDRep2UsOnTxHistory({
    yoroiDRepIdHex: '1',
    currentDRepIdHex: 'hi',
    isStaking: true,
    dismissedAt,
    ptBalance: 0n,
    ptMinBalance: 0n,
  })

  return <DelegateToYoroiDRepBanner onDismiss={dismiss} isVisible={isVisible} />
}
