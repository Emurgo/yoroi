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
import {useCreateGovernanceTx} from '~/features/Staking/hooks/useCreateGovernanceTx'
import {useStakingKey} from '~/features/Staking/hooks/useStakingKey'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'

import {Action} from '../../common/Action/Action'
import {
  mapStakingKeyStateToGovernanceAction,
  useGovernanceActions,
} from '../../common/helpers'
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
  const governanceActions = useGovernanceActions()

  const createDelegationCertificate = useDelegationCertificate()
  const createVotingCertificate = useVotingCertificate()

  const createGovernanceTxMutation = useCreateGovernanceTx(wallet)
  const [pendingDelegateOptions, setPendingDelegateOptions] = React.useState<{
    hash: string
    type: 'key' | 'script'
    CIP105: boolean
  } | null>(null)

  React.useEffect(() => {
    if (
      pendingDelegateOptions &&
      createGovernanceTxMutation.value &&
      !createGovernanceTxMutation.isPending
    ) {
      governanceActions.handleDelegateAction({
        unsignedTx: createGovernanceTxMutation.value,
        hash: pendingDelegateOptions.hash,
        type: pendingDelegateOptions.type,
        CIP105: pendingDelegateOptions.CIP105,
      })
      setPendingDelegateOptions(null)
    }
  }, [
    pendingDelegateOptions,
    createGovernanceTxMutation.value,
    createGovernanceTxMutation.isPending,
    governanceActions,
  ])

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
    openDRepIdModal(async (options) => {
      const stakingKey = wallet.getStakingKey()

      setPendingVote('delegate-not-yoroi')

      const certificate = await createDelegationCertificate({
        hash: options.hash,
        type: options.type,
        stakingKey,
      })

      setPendingDelegateOptions({
        hash: options.hash,
        type: options.type,
        CIP105: options.CIP105,
      })

      createGovernanceTxMutation.resolve({
        certificates: [certificate],
        addressMode: meta.addressMode,
      })
    })
  }

  const handleDelegateToYoroi = async () => {
    const stakingKey = wallet.getStakingKey()

    setPendingVote('delegate-to-yoroi')

    const certificate = await createDelegationCertificate({
      hash: GOVERNANCE_YOROI_DREP_ID_HEX,
      type: 'key',
      stakingKey,
    })

    createGovernanceTxMutation.resolve({
      certificates: [certificate],
      addressMode: meta.addressMode,
    })

    if (createGovernanceTxMutation.value) {
      governanceActions.handleDelegateAction({
        unsignedTx: createGovernanceTxMutation.value,
        hash: GOVERNANCE_YOROI_DREP_ID_HEX,
        type: 'key',
        CIP105: false,
      })
    }
  }

  const handleAbstain = async () => {
    const stakingKey = wallet.getStakingKey()
    setPendingVote('abstain')

    const certificate = await createVotingCertificate({
      vote: 'abstain',
      stakingKey,
    })

    createGovernanceTxMutation.resolve({
      certificates: [certificate],
      addressMode: meta.addressMode,
    })

    if (createGovernanceTxMutation.value) {
      governanceActions.handleAbstainAction({
        unsignedTx: createGovernanceTxMutation.value,
      })
    }
  }

  const handleNoConfidence = async () => {
    const stakingKey = wallet.getStakingKey()
    setPendingVote('no-confidence')

    const certificate = await createVotingCertificate({
      vote: 'no-confidence',
      stakingKey,
    })

    createGovernanceTxMutation.resolve({
      certificates: [certificate],
      addressMode: meta.addressMode,
    })

    if (createGovernanceTxMutation.value) {
      governanceActions.handleNoConfidenceAction({
        unsignedTx: createGovernanceTxMutation.value,
      })
    }
  }

  const voteKind = action?.kind
  const voteHash =
    voteKind === 'delegate' && action != null ? action.hash : undefined
  const isCreatingTx = createGovernanceTxMutation.isPending
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
