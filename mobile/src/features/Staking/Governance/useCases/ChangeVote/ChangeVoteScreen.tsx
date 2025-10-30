import {isNonNullable} from '@yoroi/common'
import {
  GOVERNANCE_YOROI_DREP_ID_HEX,
  GovernanceProvider,
  useDelegationCertificate,
  useGovernance,
  useStakingKeyState,
  useVotingCertificate,
} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {useRemoteConfig} from '~/features/RemoteConfig/hooks/useRemoteConfig'
import {LearnMoreLink} from '~/features/Staking/Governance/common/LearnMoreLink/LearnMoreLink'
import {YoroiRecordLink} from '~/features/Staking/Governance/common/YoroiRecordLink/YoroiRecordLink'
import {useStakingKey} from '~/features/Staking/hooks/useStakingKey'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'

import {Action} from '../../common/Action/Action'
import {mapStakingKeyStateToGovernanceAction} from '../../common/helpers'
import {useGovernanceTransaction} from '../../common/useGovernanceTransaction'
import {EnterDrepIdModal} from '../EnterDrepIdModal/EnterDrepIdModal'

export const ChangeVoteScreen = () => {
  const {config} = useRemoteConfig()
  const isYoroiDrepBannerEnabled = Boolean(config?.banners?.yoroiDrep?.display)
  const strings = useStrings()
  const {wallet, meta} = useSelectedWallet()
  const {atoms: ta} = useTheme()
  const stakingKeyHash = useStakingKey(wallet)
  const {data: stakingStatus} = useStakingKeyState(stakingKeyHash)
  const action = stakingStatus
    ? mapStakingKeyStateToGovernanceAction(stakingStatus)
    : null
  const {openModal} = useModal()
  const {manager} = useGovernance()
  const [pendingVote, setPendingVote] = React.useState<
    | 'abstain'
    | 'no-confidence'
    | 'delegate-to-yoroi'
    | 'delegate-not-yoroi'
    | null
  >(null)
  const governanceTransaction = useGovernanceTransaction(wallet)

  const createDelegationCertificate = useDelegationCertificate()
  const createVotingCertificate = useVotingCertificate()

  if (!isNonNullable(action)) throw new Error('User has never voted')

  const openDRepIdModal = (
    onSubmit: (options: {
      hash: string
      type: 'script' | 'key'
      CIP105: boolean
    }) => void,
  ) => {
    openModal({
      title: strings.staking.enterDRepID,
      content: (
        <GovernanceProvider manager={manager}>
          <EnterDrepIdModal onSubmit={onSubmit} />
        </GovernanceProvider>
      ),
      height: 360,
    })
  }

  const handleDelegate = () => {
    openDRepIdModal((options) => {
      const stakingKey = wallet.getStakingKey()

      setPendingVote('delegate-not-yoroi')

      const certificate = createDelegationCertificate({
        hash: options.hash,
        type: options.type,
        stakingKey,
      })

      governanceTransaction.submitDelegation(
        options,
        [certificate],
        meta.addressMode,
      )
    })
  }

  const handleDelegateToYoroi = () => {
    const stakingKey = wallet.getStakingKey()

    setPendingVote('delegate-to-yoroi')

    const certificate = createDelegationCertificate({
      hash: GOVERNANCE_YOROI_DREP_ID_HEX,
      type: 'key',
      stakingKey,
    })

    const options = {
      hash: GOVERNANCE_YOROI_DREP_ID_HEX,
      type: 'key' as const,
      CIP105: false,
    }
    governanceTransaction.submitDelegation(
      options,
      [certificate],
      meta.addressMode,
    )
  }

  const handleAbstain = () => {
    const stakingKey = wallet.getStakingKey()
    setPendingVote('abstain')

    const certificate = createVotingCertificate({
      vote: 'abstain',
      stakingKey,
    })

    governanceTransaction.submitVote('abstain', [certificate], meta.addressMode)
  }

  const handleNoConfidence = () => {
    const stakingKey = wallet.getStakingKey()
    setPendingVote('no-confidence')

    const certificate = createVotingCertificate({
      vote: 'no-confidence',
      stakingKey,
    })

    governanceTransaction.submitVote(
      'no-confidence',
      [certificate],
      meta.addressMode,
    )
  }

  const voteKind = action?.kind
  const voteHash =
    voteKind === 'delegate' && action != null ? action.hash : undefined
  const isCreatingTx = governanceTransaction.isCreatingTx
  const isDelegatingNotToYoroiDrep =
    voteKind === 'delegate' && voteHash !== GOVERNANCE_YOROI_DREP_ID_HEX

  return (
    <ScrollView style={[a.flex_1, a.px_lg, ta.bg_color_max]}>
      <View>
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
          {strings.staking.reviewActions}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.flex_1, a.gap_lg]}>
        {isYoroiDrepBannerEnabled &&
          (voteKind !== 'delegate' || isDelegatingNotToYoroiDrep) && (
            <Action
              title={strings.staking.delegateToAYoroiDrep}
              description={strings.staking.delegateToAYoroiDRepDescription}
              onPress={handleDelegateToYoroi}
              pending={isCreatingTx && pendingVote === 'delegate-to-yoroi'}
              showGradient
            >
              <YoroiRecordLink />
            </Action>
          )}

        {voteKind !== 'delegate' && (
          <Action
            title={strings.staking.actionDelegateToADRepTitle}
            description={strings.staking.actionDelegateToADRepDescription}
            onPress={handleDelegate}
            pending={isCreatingTx && pendingVote === 'delegate-not-yoroi'}
          />
        )}

        {voteKind === 'delegate' && (
          <Action
            title={strings.staking.changeDRep}
            description={strings.staking.actionDelegateToADRepDescription}
            onPress={handleDelegate}
            pending={isCreatingTx && pendingVote === 'delegate-not-yoroi'}
          />
        )}

        {voteKind !== 'abstain' && (
          <Action
            title={strings.staking.actionAbstainTitle}
            description={strings.staking.actionAbstainDescription}
            onPress={handleAbstain}
            pending={isCreatingTx && pendingVote === 'abstain'}
          />
        )}

        {voteKind !== 'no-confidence' && (
          <Action
            title={strings.staking.actionNoConfidenceTitle}
            description={strings.staking.actionNoConfidenceDescription}
            onPress={handleNoConfidence}
            pending={isCreatingTx && pendingVote === 'no-confidence'}
          />
        )}
      </View>

      <Space.Height.sm fill />

      <LearnMoreLink />

      <Space.Height.lg />
    </ScrollView>
  )
}
