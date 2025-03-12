import {shouldShowDRep2UsOnStakingCenter, useBanner} from '@yoroi/banners'
import {Banners} from '@yoroi/types'
import * as React from 'react'

import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {DelegateToYoroiDRepBanner} from '../common/DelegateToYoroiDRepBanner/DelegateToYoroiDRepBanner'

export const ConsiderDRepToUsStakingCenterBanner = () => {
  const {
    wallet: {bannersManager: manager},
  } = useSelectedWallet()
  const {dismiss, dismissedAt} = useBanner({id: Banners.Id.DRep2UsStakingCenter, manager})

  const isVisible = shouldShowDRep2UsOnStakingCenter({
    yoroiDRepIdHex: '1',
    currentDRepIdHex: 'hi',
    isStaking: true,
    dismissedAt,
  })

  return <DelegateToYoroiDRepBanner onDismiss={dismiss} isVisible={isVisible} />
}
