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
import {useGovernanceVoteFlow} from '../../common/useGovernanceVoteFlow'
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

  const createDelegationCertificate = useDelegationCertificate()
  const createVotingCertificate = useVotingCertificate()

  const {
    pendingVote,
    isCreatingTx,
    submitDelegate,
    submitAbstain,
    submitNoConfidence,
  } = useGovernanceVoteFlow({
    wallet,
    addressMode: meta.addressMode,
  })

  if (!isNonNullable(action)) throw new Error('User has never voted')

  const isPending = isCreatingTx || pendingVote !== null

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
    if (isPending) return
    openDRepIdModal(async (options) => {
      const stakingKey = wallet.getStakingKey()

      const certificate = await createDelegationCertificate({
        hash: options.hash,
        type: options.type,
        stakingKey,
      })

      submitDelegate([certificate], options)
    })
  }

  const handleDelegateToYoroi = async () => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()

    const options = {
      hash: GOVERNANCE_YOROI_DREP_ID_HEX,
      type: 'key' as const,
      CIP105: false,
    }

    const certificate = await createDelegationCertificate({
      hash: GOVERNANCE_YOROI_DREP_ID_HEX,
      type: 'key',
      stakingKey,
    })

    submitDelegate([certificate], options)
  }

  const handleAbstain = async () => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()

    const certificate = await createVotingCertificate({
      vote: 'abstain',
      stakingKey,
    })

    submitAbstain([certificate])
  }

  const handleNoConfidence = async () => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()

    const certificate = await createVotingCertificate({
      vote: 'no-confidence',
      stakingKey,
    })

    submitNoConfidence([certificate])
  }

  const voteKind = action?.kind
  const voteHash =
    voteKind === 'delegate' && action != null ? action.hash : undefined
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
              pending={isCreatingTx && pendingVote === 'delegate-yoroi'}
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
            pending={isCreatingTx && pendingVote === 'delegate-other'}
          />
        )}

        {voteKind === 'delegate' && (
          <Action
            title={strings.staking.changeDRep}
            description={strings.staking.actionDelegateToADRepDescription}
            onPress={handleDelegate}
            pending={isCreatingTx && pendingVote === 'delegate-other'}
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
