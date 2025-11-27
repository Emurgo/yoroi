import {isNonNullable} from '@yoroi/common'
import {
  getYoroiDrepIdHex,
  GovernanceProvider,
  useDelegationCertificate,
  useGovernance,
  useStakingKeyState,
  useVotingCertificate,
} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import {useRoute} from '@react-navigation/native'
import * as React from 'react'
import {Keyboard, Text, View} from 'react-native'
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
  const route = useRoute()
  const routeParams = route.params as {drepId?: string} | undefined
  const stakingKeyHash = useStakingKey(wallet)
  const {data: stakingStatus} = useStakingKeyState(stakingKeyHash)
  const action = stakingStatus
    ? mapStakingKeyStateToGovernanceAction(stakingStatus)
    : null
  const {openModal, closeModal: closeModalOriginal} = useModal()
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
  const mountedDrepIdRef = React.useRef<string | undefined>(undefined)
  const justClosedRef = React.useRef(false)
  const resetJustClosedTimeoutRef = React.useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined)

  // Helper to mark modal as just closed and reset flag after delay
  const markJustClosed = React.useCallback(() => {
    justClosedRef.current = true
    if (resetJustClosedTimeoutRef.current) {
      clearTimeout(resetJustClosedTimeoutRef.current)
    }
    resetJustClosedTimeoutRef.current = setTimeout(() => {
      justClosedRef.current = false
      resetJustClosedTimeoutRef.current = undefined
    }, 500)
  }, [])

  // Reset ref when component mounts with a new drepId (fresh navigation)
  React.useEffect(() => {
    const currentDrepId = routeParams?.drepId
    if (currentDrepId && mountedDrepIdRef.current !== currentDrepId) {
      hasOpenedModalRef.current = undefined
      mountedDrepIdRef.current = currentDrepId
      justClosedRef.current = false
      if (resetJustClosedTimeoutRef.current) {
        clearTimeout(resetJustClosedTimeoutRef.current)
        resetJustClosedTimeoutRef.current = undefined
      }
    }
  }, [routeParams?.drepId])

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (resetJustClosedTimeoutRef.current) {
        clearTimeout(resetJustClosedTimeoutRef.current)
      }
    }
  }, [])

  // Wrap closeModal to prevent immediate reopening after closing
  const closeModal = React.useCallback(() => {
    markJustClosed()
    closeModalOriginal()
  }, [closeModalOriginal, markJustClosed])

  const openDRepIdModal = React.useCallback(
    (
      onSubmit: (options: {
        hash: string
        type: 'script' | 'key'
        CIP105: boolean
      }) => void,
      initialDrepId?: string,
    ) => {
      // Set ref only when we actually open the modal, not before
      if (initialDrepId) {
        hasOpenedModalRef.current = initialDrepId
      }
      openModal({
        title: strings.staking.enterDRepID,
        content: (
          <GovernanceProvider manager={manager}>
            <EnterDrepIdModal
              onSubmit={onSubmit}
              initialDrepId={initialDrepId}
            />
          </GovernanceProvider>
        ),
        height: 400,
        canDiscard: true,
        onClose: markJustClosed,
      })
    },
    [openModal, strings.staking.enterDRepID, manager, markJustClosed],
  )

  const handleDelegate = React.useCallback(
    (initialDrepId?: string) => {
      if (isPending) return
      openDRepIdModal(async (options) => {
        const stakingKey = wallet.getStakingKey()

        const certificate = await createDelegationCertificate({
          hash: options.hash,
          type: options.type,
          stakingKey,
        })

        // Close modal immediately - dismiss keyboard first since closeModal returns early if keyboard is open
        Keyboard.dismiss()
        closeModal()
        submitDelegate([certificate], options)
      }, initialDrepId)
    },
    [
      isPending,
      openDRepIdModal,
      wallet,
      createDelegationCertificate,
      submitDelegate,
      closeModal,
    ],
  )

  // Close modal when transaction creation completes (success or error)
  const prevIsCreatingTx = React.useRef(isCreatingTx)
  React.useEffect(() => {
    if (prevIsCreatingTx.current && !isCreatingTx) {
      // Transaction creation finished (either success or error)
      closeModal()
    }
    prevIsCreatingTx.current = isCreatingTx
  }, [isCreatingTx, closeModal])

  // Check if we have a drepId from route params and open modal automatically
  React.useEffect(() => {
    const drepId = routeParams?.drepId
    if (
      drepId &&
      !isPending &&
      hasOpenedModalRef.current !== drepId &&
      !justClosedRef.current
    ) {
      // Small delay to ensure screen is mounted
      const timer = setTimeout(() => {
        handleDelegate(drepId)
      }, 100)
      return () => {
        clearTimeout(timer)
      }
    }
    return undefined
  }, [routeParams?.drepId, isPending, handleDelegate])

  const yoroiDrepIdHex = React.useMemo(
    () => getYoroiDrepIdHex(wallet.networkManager.network),
    [wallet.networkManager.network],
  )

  const handleDelegateToYoroi = async () => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()

    const options = {
      hash: yoroiDrepIdHex,
      type: 'key' as const,
      CIP105: false,
    }

    const certificate = await createDelegationCertificate({
      hash: yoroiDrepIdHex,
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
    voteKind === 'delegate' && voteHash !== yoroiDrepIdHex

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
