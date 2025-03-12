import {shouldShowDRep2UsOnTxHistory, useBanner} from '@yoroi/banners'
import {Banners} from '@yoroi/types'
import * as React from 'react'

import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {DelegateToYoroiDRepBanner} from '../common/DelegateToYoroiDRepBanner/DelegateToYoroiDRepBanner'
import {GOVERNANCE_YOROI_DREP_ID_HEX} from '@yoroi/staking'

export const ConsiderDRepToUsTxHistoryBanner = () => {
  const {
    wallet: {bannersManager: manager},
  } = useSelectedWallet()
  const {dismiss, dismissedAt} = useBanner({id: Banners.Id.DRep2UsTxHistory, manager})

  const isVisible = shouldShowDRep2UsOnTxHistory({
    yoroiDRepIdHex: GOVERNANCE_YOROI_DREP_ID_HEX,
    currentDRepIdHex: 'hi',
    isStaking: true,
    dismissedAt,
    ptBalance: 0n,
    ptMinBalance: 0n,
  })

  return <DelegateToYoroiDRepBanner onDismiss={dismiss} isVisible={isVisible} />
}
