import {
  GOVERNANCE_YOROI_DREP_ID_HEX,
  GovernanceProvider,
  useDelegationCertificate,
  useGovernance,
  useStakingKeyState,
  useVotingCertificate,
} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import {NotEnoughMoneyToSendError} from '@emurgo/yoroi-lib/dist/errors'
import * as React from 'react'
import {Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {useRemoteConfig} from '~/features/RemoteConfig/hooks/useRemoteConfig'
import {GovernanceStatusCard} from '~/features/Staking/Governance/common/GovernanceStatusCard/GovernanceStatusCard'
import {LearnMoreLink} from '~/features/Staking/Governance/common/LearnMoreLink/LearnMoreLink'
import {OtherDrepCard} from '~/features/Staking/Governance/common/OtherDrepCard/OtherDrepCard'
import {YoroiDrepCard} from '~/features/Staking/Governance/common/YoroiDrepCard/YoroiDrepCard'
import {formatDrepHashToCIP129Format} from '~/features/Staking/Governance/common/drep'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useStakingKey} from '~/features/Staking/hooks/useStakingKey'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'

import {mapStakingKeyStateToGovernanceAction} from '../../common/helpers'
import {useNavigateTo} from '../../common/navigation'
import {useGovernanceVoteFlow} from '../../common/useGovernanceVoteFlow'
import {EnterDrepIdModal} from '../EnterDrepIdModal/EnterDrepIdModal'

export const VotingOptionsScreen = () => {
  const {config} = useRemoteConfig()
  const isYoroiDrepBannerEnabled = config?.banners?.yoroiDrep?.display ?? false
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const navigateTo = useNavigateTo()
  const {wallet, meta} = useSelectedWallet()
  const {manager} = useGovernance()
  const {openModal} = useModal()
  const stakingInfo = useStakingInfo(wallet)
  const stakingKeyHash = useStakingKey(wallet)
  const {data: stakingStatus} = useStakingKeyState(stakingKeyHash)

  const action = stakingStatus
    ? mapStakingKeyStateToGovernanceAction(stakingStatus)
    : null
  const voteKind = action?.kind

  const hasStakingKeyRegistered = stakingInfo?.data?.status !== 'not-registered'
  useWalletEvent(wallet, 'utxos', stakingInfo.refetch)
  const needsToRegisterStakingKey = !hasStakingKeyRegistered

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
    options: {
      shouldThrow: false,
      onError: (error) => {
        if (error instanceof NotEnoughMoneyToSendError) {
          navigateTo.noFunds()
          return
        }
        throw error
      },
    },
  })

  const isPending = isCreatingTx || pendingVote !== null

  const openDRepIdModal = (
    onSubmit: (options: {
      hash: string
      type: 'key' | 'script'
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
      const stakeCert = needsToRegisterStakingKey
        ? manager.createStakeRegistrationCertificate(stakingKey)
        : null
      const certs =
        stakeCert !== null ? [stakeCert, certificate] : [certificate]

      submitDelegate(certs, options)
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
    const stakeCert = needsToRegisterStakingKey
      ? manager.createStakeRegistrationCertificate(stakingKey)
      : null
    const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]

    submitDelegate(certs, options)
  }

  const handleAbstain = async () => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()

    const certificate = await createVotingCertificate({
      vote: 'abstain',
      stakingKey,
    })
    const stakeCert = needsToRegisterStakingKey
      ? manager.createStakeRegistrationCertificate(stakingKey)
      : null
    const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]

    submitAbstain(certs)
  }

  const handleNoConfidence = async () => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()

    const certificate = await createVotingCertificate({
      vote: 'no-confidence',
      stakingKey,
    })
    const stakeCert = needsToRegisterStakingKey
      ? manager.createStakeRegistrationCertificate(stakingKey)
      : null
    const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]

    submitNoConfidence(certs)
  }

  const voteHash =
    voteKind === 'delegate' && action != null ? action.hash : undefined
  const voteType =
    voteKind === 'delegate' && action != null && 'type' in action
      ? action.type
      : 'key'
  const isDelegatingToYoroiDrep = voteHash === GOVERNANCE_YOROI_DREP_ID_HEX
  const isDelegatingToOtherDrep =
    voteKind === 'delegate' && voteHash && !isDelegatingToYoroiDrep
  const otherDrepDisplayId =
    isDelegatingToOtherDrep && voteHash
      ? formatDrepHashToCIP129Format(voteHash, voteType)
      : null
  const isAbstaining = voteKind === 'abstain'
  const isNoConfidence = voteKind === 'no-confidence'
  const showYoroiDrep = isYoroiDrepBannerEnabled

  return (
    <ScrollView style={[a.px_lg, a.flex_1, ta.bg_color_max]}>
      <View>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {strings.staking.votingOptionsDescription}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.flex_1, a.gap_lg]}>
        {showYoroiDrep && (
          <YoroiDrepCard
            onDelegate={
              isDelegatingToYoroiDrep ? undefined : handleDelegateToYoroi
            }
            pending={isCreatingTx && pendingVote === 'delegate-yoroi'}
            isDelegating={isDelegatingToYoroiDrep}
            truncateId
          />
        )}

        {isDelegatingToOtherDrep && otherDrepDisplayId ? (
          <OtherDrepCard
            drepId={otherDrepDisplayId}
            isDelegating
            truncateId
            onDelegate={handleDelegate}
            pending={isCreatingTx && pendingVote === 'delegate-other'}
          />
        ) : (
          <VotingOptionCard
            icon={
              <IconContainer color={p.gray_100}>
                <Icon.OtherDreps size={24} color={p.el_gray_medium} />
              </IconContainer>
            }
            title={strings.staking.otherDReps}
            description={strings.staking.actionDelegateToADRepDescription}
            onDelegate={handleDelegate}
            pending={isCreatingTx && pendingVote === 'delegate-other'}
          />
        )}

        <GovernanceStatusCard
          type="abstain"
          isDelegating={isAbstaining}
          onChangeToDrep={handleDelegate}
          onDelegate={handleAbstain}
          pending={isCreatingTx && pendingVote === 'abstain'}
        />

        <GovernanceStatusCard
          type="no-confidence"
          isDelegating={isNoConfidence}
          onChangeToDrep={handleDelegate}
          onDelegate={handleNoConfidence}
          pending={isCreatingTx && pendingVote === 'no-confidence'}
        />
      </View>

      <Space.Height.lg />

      <LearnMoreLink />

      <Space.Height.lg />
    </ScrollView>
  )
}

type VotingOptionCardProps = {
  icon: React.ReactNode
  title: string
  description: string
  onDelegate: () => void
  pending?: boolean
}

const VotingOptionCard = ({
  icon,
  title,
  description,
  onDelegate,
  pending,
}: VotingOptionCardProps) => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.rounded_sm, a.p_lg, a.border, {borderColor: p.gray_200}]}>
      <View style={[a.flex_row, a.align_center, a.gap_sm]}>
        {icon}

        <Text style={[a.heading_4_medium, ta.text_gray_medium]}>{title}</Text>
      </View>

      <Space.Height.sm />

      <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
        {description}
      </Text>

      <Space.Height.md />

      <Button
        title={strings.staking.confirmDelegation.delegateButtonLabel}
        type={ButtonType.Secondary}
        onPress={onDelegate}
        disabled={pending}
        isLoading={pending}
      />
    </View>
  )
}

const IconContainer = ({
  children,
  color,
}: {
  children: React.ReactNode
  color: string
}) => {
  return (
    <View
      style={[
        a.align_center,
        a.justify_center,
        {width: 48, height: 48, borderRadius: 24, backgroundColor: color},
      ]}
    >
      {children}
    </View>
  )
}
