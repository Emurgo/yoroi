import {isNonNullable} from '@yoroi/common'
import {
  GovernanceProvider,
  useDelegationCertificate,
  useGovernance,
  useStakingKeyState,
  useVotingCertificate,
} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {useFocusEffect, useRoute} from '@react-navigation/native'
import * as React from 'react'
import {Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {LearnMoreLink} from '~/features/Staking/Governance/common/LearnMoreLink/LearnMoreLink'
import {useStakingKey} from '~/features/Staking/hooks/useStakingKey'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'

import {Action} from '../../common/Action/Action'
import {mapStakingKeyStateToGovernanceAction} from '../../common/helpers'
import {useGovernanceVoteFlow} from '../../common/useGovernanceVoteFlow'
import {
  EnterDrepIdModal,
  HEIGHT_DEFAULT,
  HEIGHT_PREFILLED,
} from '../EnterDrepIdModal/EnterDrepIdModal'

export const ChangeVoteScreen = () => {
  const route = useRoute()
  const routeParams = route.params as {drepId?: string} | undefined

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
  // Track if we've already opened the modal for this drepId to prevent reopening
  const hasOpenedModalRef = React.useRef<string | undefined>(undefined)
  // Store timer in ref to prevent cancellation during re-renders
  const modalTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  // Wrapper to open modal with prefilled DRep ID
  const openDrepIdModal = React.useCallback(
    (
      onSubmit: (options: {
        hash: string
        type: 'key' | 'script'
        CIP105: boolean
      }) => void,
      prefilledDrepId?: string,
    ) => {
      openModal({
        title: strings.staking.enterDRepID,
        content: (
          <GovernanceProvider manager={manager}>
            <EnterDrepIdModal
              onSubmit={onSubmit}
              initialDrepId={prefilledDrepId}
            />
          </GovernanceProvider>
        ),
        height: prefilledDrepId ? HEIGHT_PREFILLED : HEIGHT_DEFAULT,
        canDiscard: true,
      })
      // Set ref only after modal is actually opened
      if (prefilledDrepId) {
        hasOpenedModalRef.current = prefilledDrepId
      }
    },
    [openModal, strings.staking.enterDRepID, manager],
  )

  const handleDelegate = React.useCallback(
    (prefilledDrepId?: string) => {
      if (isPending) {
        return
      }
      openDrepIdModal(async (options) => {
        const stakingKey = wallet.getStakingKey()

        const certificate = await createDelegationCertificate({
          hash: options.hash,
          type: options.type,
          stakingKey,
        })

        submitDelegate([certificate], options)
      }, prefilledDrepId)
    },
    [
      isPending,
      openDrepIdModal,
      wallet,
      createDelegationCertificate,
      submitDelegate,
    ],
  )

  // Check if we have a drepId from route params and open modal automatically
  // Use useFocusEffect to ensure this only runs when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const drepId = routeParams?.drepId

      // Clear any existing timer when effect runs
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current)
        modalTimerRef.current = undefined
      }

      if (drepId && !isPending && hasOpenedModalRef.current !== drepId) {
        // Store timer in ref so it persists across re-renders
        modalTimerRef.current = setTimeout(() => {
          modalTimerRef.current = undefined
          handleDelegate(drepId)
        }, 300)
      }

      // Cleanup: only clear timer if screen loses focus
      return () => {
        if (modalTimerRef.current) {
          clearTimeout(modalTimerRef.current)
          modalTimerRef.current = undefined
        }
      }
    }, [routeParams?.drepId, isPending, handleDelegate]),
  )

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current)
      }
    }
  }, [])

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

  return (
    <ScrollView style={[a.flex_1, a.px_lg, ta.bg_color_max]}>
      <View>
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
          {strings.staking.reviewActions}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.flex_1, a.gap_lg]}>
        {voteKind !== 'delegate' && (
          <Action
            title={strings.staking.actionDelegateToADRepTitle}
            description={strings.staking.actionDelegateToADRepDescription}
            onPress={() => handleDelegate()}
            pending={isCreatingTx && pendingVote === 'delegate'}
          />
        )}

        {voteKind === 'delegate' && (
          <Action
            title={strings.staking.changeDRep}
            description={strings.staking.actionDelegateToADRepDescription}
            onPress={() => handleDelegate()}
            pending={isCreatingTx && pendingVote === 'delegate'}
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
