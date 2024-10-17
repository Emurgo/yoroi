import {useAsyncStorage} from '@yoroi/common'
import {
  type StakingKeyState,
  governanceApiMaker,
  governanceManagerMaker,
  GovernanceProvider,
  useBech32DRepID,
  useGovernance,
  useStakingKeyState,
  useUpdateLatestGovernanceAction,
} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Space} from '../../../../components/Space/Space'
import {governaceAfterBlock} from '../../../../kernel/config'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useStakingKey} from '../../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {formatTokenWithText} from '../../../../yoroi-wallets/utils/format'
import {asQuantity} from '../../../../yoroi-wallets/utils/utils'
import {CardanoMobile} from '../../../../yoroi-wallets/wallets'
import {useReviewTx} from '../../../ReviewTx/common/ReviewTxProvider'
import {useBestBlock} from '../../../WalletManager/common/hooks/useBestBlock'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {GovernanceVote} from '../types'
import {useNavigateTo} from './navigation'
import {useStrings} from './strings'

export const useIsParticipatingInGovernance = (wallet: YoroiWallet) => {
  const stakingKeyHash = useStakingKey(wallet)
  const {data: stakingStatus} = useStakingKeyState(stakingKeyHash, {
    suspense: true,
    useErrorBoundary: false,
    retry: false,
  })
  return stakingStatus ? mapStakingKeyStateToGovernanceAction(stakingStatus) !== null : false
}

export const mapStakingKeyStateToGovernanceAction = (state: StakingKeyState): GovernanceVote | null => {
  if (!state.drepDelegation) return null
  const vote = state.drepDelegation
  return vote.action === 'abstain'
    ? {kind: 'abstain'}
    : vote.action === 'no-confidence'
    ? {kind: 'no-confidence'}
    : {kind: 'delegate', drepID: vote.drepID}
}

export const useIsGovernanceFeatureEnabled = (wallet: YoroiWallet) => {
  const bestBlock = useBestBlock({options: {suspense: true}})
  return bestBlock.height >= governaceAfterBlock[wallet.networkManager.network]
}

export const useGovernanceManagerMaker = () => {
  const {
    wallet: {
      networkManager: {network},
      id: walletId,
    },
  } = useSelectedWallet()

  const storage = useAsyncStorage()
  const governanceStorage = storage.join(`wallet/${walletId}/staking-governance/`)

  return React.useMemo(
    () =>
      governanceManagerMaker({
        walletId,
        network,
        api: governanceApiMaker({network}),
        cardano: CardanoMobile,
        storage: governanceStorage,
      }),
    [governanceStorage, network, walletId],
  )
}

export const useGovernanceActions = () => {
  const {manager} = useGovernance()
  const {wallet} = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const {unsignedTxChanged, onSuccessChanged, onErrorChanged, operationsChanged, onNotSupportedCIP1694Changed} =
    useReviewTx()
  const {updateLatestGovernanceAction} = useUpdateLatestGovernanceAction(wallet.id)
  const {navigateToTxReview} = useWalletNavigation()

  const handleDelegateAction = ({
    drepID,
    unsignedTx,
    hasStakeCert = false,
    navigateToStakingOnSuccess = false,
  }: {
    drepID: string
    unsignedTx: YoroiUnsignedTx
    hasStakeCert?: boolean
    navigateToStakingOnSuccess?: boolean
  }) => {
    let operations = [
      <GovernanceProvider key="0" manager={manager}>
        <DelegateOperation drepID={drepID} />
      </GovernanceProvider>,
    ]

    if (hasStakeCert) operations = [<RegisterStakingKeyOperation key="-1" />, ...operations]

    operationsChanged(operations)
    onSuccessChanged((signedTx) => {
      updateLatestGovernanceAction({kind: 'delegate-to-drep', drepID, txID: signedTx.signedTx.id})
      navigateTo.txSuccess({navigateToStaking: navigateToStakingOnSuccess ?? false, kind: 'delegate'})
    })
    onErrorChanged(() => navigateTo.txFailed())
    unsignedTxChanged(unsignedTx)
    onNotSupportedCIP1694Changed(() => {
      navigateTo.notSupportedVersion()
    })

    navigateToTxReview()
  }

  const handleAbstainAction = ({
    unsignedTx,
    hasStakeCert = false,
    navigateToStakingOnSuccess = false,
  }: {
    unsignedTx: YoroiUnsignedTx
    hasStakeCert?: boolean
    navigateToStakingOnSuccess?: boolean
  }) => {
    let operations = [<AbstainOperation key="0" />]
    if (hasStakeCert) operations = [<RegisterStakingKeyOperation key="-1" />, ...operations]

    operationsChanged(operations)
    onSuccessChanged((signedTx) => {
      updateLatestGovernanceAction({kind: 'vote', vote: 'abstain', txID: signedTx.signedTx.id})
      navigateTo.txSuccess({navigateToStaking: navigateToStakingOnSuccess ?? false, kind: 'abstain'})
    })
    onErrorChanged(() => navigateTo.txFailed())
    unsignedTxChanged(unsignedTx)
    onNotSupportedCIP1694Changed(() => {
      navigateTo.notSupportedVersion()
    })

    navigateToTxReview()
  }

  const handleNoConfidenceAction = ({
    unsignedTx,
    hasStakeCert = false,
    navigateToStakingOnSuccess = false,
  }: {
    unsignedTx: YoroiUnsignedTx
    hasStakeCert?: boolean
    navigateToStakingOnSuccess?: boolean
  }) => {
    let operations = [<NoConfidenceOperation key="0" />]
    if (hasStakeCert) operations = [<RegisterStakingKeyOperation key="-1" />, ...operations]

    operationsChanged(operations)
    onSuccessChanged((signedTx) => {
      updateLatestGovernanceAction({kind: 'vote', vote: 'no-confidence', txID: signedTx.signedTx.id})
      navigateTo.txSuccess({
        navigateToStaking: navigateToStakingOnSuccess ?? false,
        kind: 'no-confidence',
      })
    })
    onErrorChanged(() => navigateTo.txFailed())
    unsignedTxChanged(unsignedTx)
    onNotSupportedCIP1694Changed(() => {
      navigateTo.notSupportedVersion()
    })

    navigateToTxReview()
  }

  return {handleDelegateAction, handleAbstainAction, handleNoConfidenceAction} as const
}

const RegisterStakingKeyOperation = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.registerStakingKey}</Text>

      <Space width="lg" />

      <Text style={styles.operationValue}>
        {formatTokenWithText(asQuantity(wallet.protocolParams.keyDeposit), wallet.portfolioPrimaryTokenInfo)}
      </Text>
    </View>
  )
}

const AbstainOperation = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.selectAbstain}</Text>
    </View>
  )
}

const NoConfidenceOperation = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.selectNoConfidence}</Text>
    </View>
  )
}

const DelegateOperation = ({drepID}: {drepID: string}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  const {data: bech32DrepId} = useBech32DRepID(drepID)

  return (
    <View style={styles.operation}>
      <Text style={styles.operationLabel}>{strings.delegateVotingToDRep}</Text>

      <Space width="lg" />

      <Text style={styles.operationValue}>{bech32DrepId ?? drepID}</Text>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    operation: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_start,
    },
    operationLabel: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_low,
    },
    operationValue: {
      ...atoms.flex_1,
      ...atoms.text_right,
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
    },
  })

  return {styles} as const
}
