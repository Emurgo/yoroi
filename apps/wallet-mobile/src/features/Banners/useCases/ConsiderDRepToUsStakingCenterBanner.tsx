import {shouldShowDRep2UsOnStakingCenter, useBanner} from '@yoroi/banners'
import {GOVERNANCE_YOROI_DREP_ID_HEX} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import {Banners} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet} from 'react-native'

import {useStakingInfo} from '../../../legacy/Dashboard/StakePoolInfos'
import {useGovernanceStatus} from '../../Staking/Governance/common/helpers'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {DelegateToYoroiDRepBanner} from '../common/DelegateToYoroiDRepBanner/DelegateToYoroiDRepBanner'

export const ConsiderDRepToUsStakingCenterBanner = () => {
  const {
    wallet: {bannersManager: manager},
  } = useSelectedWallet()
  const {dismiss, dismissedAt} = useBanner({id: Banners.Id.DRep2UsStakingCenter, manager})
  const {wallet} = useSelectedWallet()
  const stakingInfo = useStakingInfo(wallet, {suspense: true})
  const hasStakingKeyRegistered = stakingInfo?.data?.status !== 'not-registered'

  const {styles} = useStyles()

  const action = useGovernanceStatus({suspense: true, refetchOnMount: true})

  const isVisible = shouldShowDRep2UsOnStakingCenter({
    yoroiDRepIdHex: GOVERNANCE_YOROI_DREP_ID_HEX,
    currentDRepIdHex: action?.kind === 'delegate' && action.type === 'key' ? action.hash : '',
    isStaking: hasStakingKeyRegistered,
    dismissedAt,
    isMainnet: wallet.isMainnet,
  })

  return <DelegateToYoroiDRepBanner style={styles.root} onDismiss={dismiss} isVisible={isVisible} />
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.pb_xl,
    },
  })
  return {styles}
}
