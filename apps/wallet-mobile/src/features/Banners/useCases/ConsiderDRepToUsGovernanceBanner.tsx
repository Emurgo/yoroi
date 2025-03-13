import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {shouldShowDRep2UsOnStakingCenter, useBanner} from '@yoroi/banners'
import {Banners} from '@yoroi/types'
import {useStakingInfo} from '../../../legacy/Dashboard/StakePoolInfos'
import {useStakingKey} from '../../../yoroi-wallets/hooks'
import {GOVERNANCE_YOROI_DREP_ID_HEX, useStakingKeyState} from '@yoroi/staking'
import {mapStakingKeyStateToGovernanceAction} from '../../Staking/Governance/common/helpers'
import {DelegateToYoroiDRepBanner} from '../common/DelegateToYoroiDRepBanner/DelegateToYoroiDRepBanner'
import {useTheme} from '@yoroi/theme'
import {StyleSheet} from 'react-native'
import * as React from 'react'
import {shouldShowDrep2usOnGovernance} from '@yoroi/banners/src'

export const ConsiderDRepToUsGovernanceBanner = () => {
  const {wallet} = useSelectedWallet()
  const stakingKeyHash = useStakingKey(wallet)

  const {data: stakingStatus} = useStakingKeyState(stakingKeyHash, {
    refetchOnMount: true,
    suspense: true,
  })

  const styles = useStyles()

  const action = stakingStatus ? mapStakingKeyStateToGovernanceAction(stakingStatus) : null

  const isVisible = shouldShowDrep2usOnGovernance({
    yoroiDRepIdHex: GOVERNANCE_YOROI_DREP_ID_HEX,
    currentDRepIdHex: action?.kind === 'delegate' && action.type === 'key' ? action.hash : '',
  })

  return <DelegateToYoroiDRepBanner style={styles.root} isVisible={isVisible} />
}

const useStyles = () => {
  const {atoms} = useTheme()
  return StyleSheet.create({
    root: {
      ...atoms.pb_xl,
    },
  })
}
