import {shouldShowDRep2UsOnTxHistory, useBanner} from '@yoroi/banners'
import {GOVERNANCE_YOROI_DREP_ID_HEX, useStakingKeyState} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import {Banners} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet} from 'react-native'

import {useStakingInfo} from '../../../legacy/Dashboard/StakePoolInfos'
import {useStakingKey} from '../../../yoroi-wallets/hooks'
import {usePortfolioPrimaryBalance} from '../../Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {mapStakingKeyStateToGovernanceAction} from '../../Staking/Governance/common/helpers'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {DelegateToYoroiDRepBanner} from '../common/DelegateToYoroiDRepBanner/DelegateToYoroiDRepBanner'

const minBalanceToDisplayBanner = 5 // 5 ADA

export const ConsiderDRepToUsTxHistoryBanner = () => {
  const {
    wallet: {bannersManager: manager},
  } = useSelectedWallet()
  const {dismiss, dismissedAt} = useBanner({id: Banners.Id.DRep2UsTxHistory, manager})
  const {styles} = useStyles()
  const {wallet} = useSelectedWallet()
  const stakingInfo = useStakingInfo(wallet, {suspense: true})
  const hasStakingKeyRegistered = stakingInfo?.data?.status !== 'not-registered'
  const stakingKeyHash = useStakingKey(wallet)

  const {data: stakingStatus} = useStakingKeyState(stakingKeyHash, {
    refetchOnMount: true,
    suspense: true,
  })

  const action = stakingStatus ? mapStakingKeyStateToGovernanceAction(stakingStatus) : null
  const ptDecimals = wallet?.portfolioPrimaryTokenInfo.decimals ?? 0
  const balance = usePortfolioPrimaryBalance({wallet})

  const isVisible = shouldShowDRep2UsOnTxHistory({
    yoroiDRepIdHex: GOVERNANCE_YOROI_DREP_ID_HEX,
    currentDRepIdHex: action?.kind === 'delegate' && action.type === 'key' ? action.hash : '',
    isStaking: hasStakingKeyRegistered,
    dismissedAt,
    ptBalance: balance.quantity,
    ptMinBalance: BigInt(minBalanceToDisplayBanner) * BigInt(10 ** ptDecimals),
  })

  return <DelegateToYoroiDRepBanner style={styles.root} onDismiss={dismiss} isVisible={isVisible} />
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.px_lg,
    },
  })

  return {styles}
}
