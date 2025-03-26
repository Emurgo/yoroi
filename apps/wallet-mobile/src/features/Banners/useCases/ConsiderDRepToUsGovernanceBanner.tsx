import {shouldShowDrep2usOnGovernance} from '@yoroi/banners'
import {GOVERNANCE_YOROI_DREP_ID_HEX} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet} from 'react-native'

import {useGovernanceStatus} from '../../Staking/Governance/common/helpers'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {DelegateToYoroiDRepBanner} from '../common/DelegateToYoroiDRepBanner/DelegateToYoroiDRepBanner'

export const ConsiderDRepToUsGovernanceBanner = () => {
  const {styles} = useStyles()
  const {
    wallet: {isMainnet},
  } = useSelectedWallet()

  const action = useGovernanceStatus({suspense: true, refetchOnMount: true})

  const isVisible = shouldShowDrep2usOnGovernance({
    yoroiDRepIdHex: GOVERNANCE_YOROI_DREP_ID_HEX,
    currentDRepIdHex: action?.kind === 'delegate' && action.type === 'key' ? action.hash : '',
    isMainnet,
  })

  return <DelegateToYoroiDRepBanner style={styles.root} isVisible={isVisible} />
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
