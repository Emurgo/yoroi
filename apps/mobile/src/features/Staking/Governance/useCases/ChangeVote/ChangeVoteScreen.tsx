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
import React from 'react'
import {Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {useModal} from '../../../../../ui/Modal/ModalContext'
import {Space} from '../../../../../ui/Space/Space'
import {
  useCreateGovernanceTx,
  useStakingKey,
} from '../../../../../wallets/hooks'
import {useSelectedWallet} from '../../../../WalletManager/hooks/useSelectedWallet'
import {Action} from '../../common/Action/Action'
import {
  mapStakingKeyStateToGovernanceAction,
  useGovernanceActions,
} from '../../common/helpers'
import {LearnMoreLink} from '../../common/LearnMoreLink/LearnMoreLink'
import {useStrings} from '../../common/strings'
import {YoroiRecordLink} from '../../common/YoroiRecordLink/YoroiRecordLink'
import {EnterDrepIdModal} from '../EnterDrepIdModal/EnterDrepIdModal'

export const ChangeVoteScreen = () => {
  const strings = useStrings()
  const {wallet, meta} = useSelectedWallet()
  const stakingKeyHash = useStakingKey(wallet)
  const {atoms: ta} = useTheme()
  const {data: stakingStatus} = useStakingKeyState(stakingKeyHash, {
    suspense: true,
  })
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

  const {
    createCertificate: createDelegationCertificate,
    isLoading: isCreatingDelegationCertificate,
  } = useDelegationCertificate({
    useErrorBoundary: true,
  })

  const {
    createCertificate: createVotingCertificate,
    isLoading: isCreatingVotingCertificate,
  } = useVotingCertificate({
    useErrorBoundary: true,
  })

  const createGovernanceTxMutation = useCreateGovernanceTx(wallet, {
    useErrorBoundary: true,
  })

  if (!isNonNullable(action)) throw new Error('User has never voted')

  const openDRepIdModal = (
    onSubmit: (options: {
      hash: string
      type: 'script' | 'key'
      CIP105: boolean
    }) => void,
  ) => {
    openModal({
      title: strings.enterDRepID,
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
      const stakingKey = await wallet.getStakingKey()

      setPendingVote('delegate-not-yoroi')

      createDelegationCertificate(
        {hash: options.hash, type: options.type, stakingKey},
        {
          onSuccess: async (certificate) => {
            const unsignedTx = await createGovernanceTxMutation.mutateAsync({
              certificates: [certificate],
              addressMode: meta.addressMode,
            })

            governanceActions.handleDelegateAction({
              unsignedTx,
              hash: options.hash,
              type: options.type,
              CIP105: options.CIP105,
            })
          },
        },
      )
    })
  }

  const handleDelegateToYoroi = async () => {
    const stakingKey = await wallet.getStakingKey()

    setPendingVote('delegate-to-yoroi')

    createDelegationCertificate(
      {hash: GOVERNANCE_YOROI_DREP_ID_HEX, type: 'key', stakingKey},
      {
        onSuccess: async (certificate) => {
          const unsignedTx = await createGovernanceTxMutation.mutateAsync({
            certificates: [certificate],
            addressMode: meta.addressMode,
          })

          governanceActions.handleDelegateAction({
            unsignedTx,
            hash: GOVERNANCE_YOROI_DREP_ID_HEX,
            type: 'key',
            CIP105: false,
          })
        },
      },
    )
  }

  const handleAbstain = async () => {
    const stakingKey = await wallet.getStakingKey()
    setPendingVote('abstain')

    createVotingCertificate(
      {vote: 'abstain', stakingKey},
      {
        onSuccess: async (certificate) => {
          const unsignedTx = await createGovernanceTxMutation.mutateAsync({
            certificates: [certificate],
            addressMode: meta.addressMode,
          })

          governanceActions.handleAbstainAction({
            unsignedTx,
          })
        },
      },
    )
  }

  const handleNoConfidence = async () => {
    const stakingKey = await wallet.getStakingKey()
    setPendingVote('no-confidence')

    createVotingCertificate(
      {vote: 'no-confidence', stakingKey},
      {
        onSuccess: async (certificate) => {
          const unsignedTx = await createGovernanceTxMutation.mutateAsync({
            certificates: [certificate],
            addressMode: meta.addressMode,
          })

          governanceActions.handleNoConfidenceAction({
            unsignedTx,
          })
        },
      },
    )
  }

  const voteKind = action?.kind
  const voteHash =
    voteKind === 'delegate' && action != null ? action.hash : undefined
  const isCreatingTx =
    createGovernanceTxMutation.isLoading ||
    isCreatingVotingCertificate ||
    isCreatingDelegationCertificate
  const isDelegatingToDrep =
    voteKind === 'delegate' && voteHash !== GOVERNANCE_YOROI_DREP_ID_HEX

  return (
    <ScrollView style={[a.flex_1, a.px_lg, ta.bg_color_max]}>
      <View>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {strings.reviewActions}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.flex_1, a.gap_lg]}>
        {(voteKind !== 'delegate' || isDelegatingToDrep) && (
          <Action
            title={strings.delegateToAYoroiDrep}
            description={strings.delegateToAYoroiDRepDescription}
            onPress={handleDelegateToYoroi}
            pending={isCreatingTx && pendingVote === 'delegate-to-yoroi'}
            showGradient
          >
            <YoroiRecordLink />
          </Action>
        )}

        {voteKind !== 'delegate' && (
          <Action
            title={strings.actionDelegateToADRepTitle}
            description={strings.actionDelegateToADRepDescription}
            onPress={handleDelegate}
            pending={isCreatingTx && pendingVote === 'delegate-not-yoroi'}
          />
        )}

        {voteKind === 'delegate' && (
          <Action
            title={strings.changeDRep}
            description={strings.actionDelegateToADRepDescription}
            onPress={handleDelegate}
            pending={isCreatingTx && pendingVote === 'delegate-not-yoroi'}
          />
        )}

        {voteKind !== 'abstain' && (
          <Action
            title={strings.actionAbstainTitle}
            description={strings.actionAbstainDescription}
            onPress={handleAbstain}
            pending={isCreatingTx && pendingVote === 'abstain'}
          />
        )}

        {voteKind !== 'no-confidence' && (
          <Action
            title={strings.actionNoConfidenceTitle}
            description={strings.actionNoConfidenceDescription}
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
