import {
  GovernanceProvider,
  useDelegationCertificate,
  useGovernance,
} from '@yoroi/staking'
import {ThemedPalette, atoms as a, useTheme} from '@yoroi/theme'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

import {useRoute} from '@react-navigation/native'
import * as React from 'react'
import {Keyboard, Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {useRemoteConfig} from '~/common/hooks/useRemoteConfig'
import {GovernanceStatusCard} from '~/features/Staking/Governance/common/GovernanceStatusCard/GovernanceStatusCard'
import {LearnMoreLink} from '~/features/Staking/Governance/common/LearnMoreLink/LearnMoreLink'
import {OtherDrepCard} from '~/features/Staking/Governance/common/OtherDrepCard/OtherDrepCard'
import {YoroiDrepCard} from '~/features/Staking/Governance/common/YoroiDrepCard/YoroiDrepCard'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'

import {Action} from '../../common/Action/Action'
import {
  useHomeScreen,
  useNeverParticipatedGovernance,
  useParticipatingGovernance,
} from '../../common/helpers'
import {useNavigateTo} from '../../common/navigation'
import {useGovernanceVoteFlow} from '../../common/useGovernanceVoteFlow'
import {GovernanceVote} from '../../types'
import {EnterDrepIdModal} from '../EnterDrepIdModal/EnterDrepIdModal'
import {useOpenDrepIdModal} from '../EnterDrepIdModal/useOpenDrepIdModal'

export const HomeScreen = () => {
  const route = useRoute()
  const routeParams = route.params as {drepId?: string} | undefined
  const navigateTo = useNavigateTo()
  const {isLoading, pendingAction, confirmedAction} = useHomeScreen()

  // Track if we've already navigated to prevent infinite loops
  const hasNavigatedRef = React.useRef<string | undefined>(undefined)

  // If user is already participating and we have a drepId from route params,
  // navigate to changeVote screen to handle the DRep change
  React.useEffect(() => {
    const drepId = routeParams?.drepId
    if (
      confirmedAction !== null &&
      drepId &&
      hasNavigatedRef.current !== drepId
    ) {
      hasNavigatedRef.current = drepId
      // Use setTimeout to ensure navigation happens after render
      const timer = setTimeout(() => {
        navigateTo.changeVote({drepId})
      }, 0)
      return () => {
        clearTimeout(timer)
      }
    }
    return undefined
  }, [confirmedAction, routeParams?.drepId, navigateTo])

  if (isLoading) return null

  if (pendingAction !== null) {
    return (
      <ParticipatingInGovernanceVariant action={pendingAction} isTxPending />
    )
  }

  if (confirmedAction !== null) {
    return <ParticipatingInGovernanceVariant action={confirmedAction} />
  }

  return (
    <NeverParticipatedInGovernanceVariant initialDrepId={routeParams?.drepId} />
  )
}

const ParticipatingInGovernanceVariant = ({
  action,
  isTxPending = false,
}: {
  action: GovernanceVote
  isTxPending?: boolean
}) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {openDrepIdModal} = useOpenDrepIdModal()

  const {
    isPending,
    displayedHash,
    isDelegatingToYoroiDrep,
    isDelegatingToDrep,
    handleDelegateToOtherDrep,
    navigateToVotingOptions,
  } = useParticipatingGovernance({action, isTxPending})

  const actionsTitles = (action: GovernanceVote) =>
    isDelegatingToYoroiDrep
      ? strings.staking.delegateToAYoroiDrep
      : isDelegatingToDrep
        ? strings.staking.delegateToADRep
        : action.kind === 'abstain'
          ? strings.staking.actionAbstainTitle
          : strings.staking.actionNoConfidenceTitle
  const selectedActionTitle = actionsTitles(action)

  const introduction = isTxPending
    ? strings.staking.actionYouHaveSelectedTxPending(
        selectedActionTitle,
        formattingOptions(p),
      )
    : strings.staking.actionYouHaveSelected(
        selectedActionTitle,
        formattingOptions(p),
      )

  const onChangeToDrep = () => {
    openDrepIdModal(handleDelegateToOtherDrep)
  }

  return (
    <ScrollView
      style={[a.px_lg, a.flex_1, ta.bg_color_max]}
      contentContainerStyle={a.flex_grow}
    >
      <View>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {introduction}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.gap_lg]}>
        {isDelegatingToYoroiDrep && (
          <YoroiDrepCard isDelegating pending={isPending} />
        )}

        {isDelegatingToDrep && displayedHash && (
          <OtherDrepCard
            drepId={displayedHash}
            isDelegating
            onDelegate={onChangeToDrep}
            pending={isPending}
          />
        )}

        {action.kind === 'abstain' && (
          <GovernanceStatusCard
            type="abstain"
            isDelegating
            onChangeToDrep={onChangeToDrep}
            pending={isPending}
          />
        )}

        {action.kind === 'no-confidence' && (
          <GovernanceStatusCard
            type="no-confidence"
            isDelegating
            onChangeToDrep={onChangeToDrep}
            pending={isPending}
          />
        )}

        <Action
          title={strings.staking.exploreOtherGovernanceOptions}
          description={strings.staking.exploreOtherGovernanceOptionsDescription}
          onPress={navigateToVotingOptions}
          showRightArrow
        />
      </View>

      <View style={a.flex_1} />

      <LearnMoreLink />

      <Space.Height.lg />
    </ScrollView>
  )
}

const formattingOptions = (p: ThemedPalette) => {
  return {
    b: (text: React.ReactNode) => {
      return (
        <Text
          style={[
            a.body_1_lg_regular,
            a.font_semibold,
            {color: p.text_gray_medium},
          ]}
        >
          {text}
        </Text>
      )
    },
    textComponent: (text: React.ReactNode) => (
      <Text style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}>
        {text}
      </Text>
    ),
  }
}

const NeverParticipatedInGovernanceVariant = ({
  initialDrepId,
}: {
  initialDrepId?: string
}) => {
  const {config} = useRemoteConfig()
  const isYoroiDrepBannerEnabled = config?.banners?.yoroiDrep?.display ?? false
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {openModal, closeModal} = useModal()
  const {manager} = useGovernance()
  const {wallet, meta} = useSelectedWallet()
  const stakingInfo = useStakingInfo(wallet)
  const needsToRegisterStakingKey =
    stakingInfo?.data?.status === 'not-registered'
  const {isPending, handleDelegateToYoroi, handleExploreOtherOptions} =
    useNeverParticipatedGovernance(initialDrepId)

  // Track if we've already opened the modal for this initialDrepId to prevent reopening
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
    if (initialDrepId && mountedDrepIdRef.current !== initialDrepId) {
      hasOpenedModalRef.current = undefined
      mountedDrepIdRef.current = initialDrepId
      justClosedRef.current = false
      if (resetJustClosedTimeoutRef.current) {
        clearTimeout(resetJustClosedTimeoutRef.current)
        resetJustClosedTimeoutRef.current = undefined
      }
    }
  }, [initialDrepId])

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (resetJustClosedTimeoutRef.current) {
        clearTimeout(resetJustClosedTimeoutRef.current)
      }
    }
  }, [])

  // Wrap closeModal to prevent immediate reopening after closing
  const closeModalWrapped = React.useCallback(() => {
    markJustClosed()
    closeModal()
  }, [closeModal, markJustClosed])

  const createDelegationCertificate = useDelegationCertificate()
  const {submitDelegate} = useGovernanceVoteFlow({
    wallet,
    addressMode: meta.addressMode,
    options: {
      onError: () => {
        // Error handling (including insufficient balance) is done by useCreateGovernanceTx
        // This ensures the modal is closed if an error occurs
        closeModalWrapped()
      },
    },
  })

  const openDRepIdModal = React.useCallback(
    (
      onSubmit: (options: {
        hash: string
        type: 'key' | 'script'
        CIP105: boolean
      }) => void,
      prefilledDrepId?: string,
    ) => {
      // Set ref only when we actually open the modal, not before
      if (prefilledDrepId) {
        hasOpenedModalRef.current = prefilledDrepId
      }
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
        // Height is managed dynamically by EnterDrepIdModal based on whether Yoroi card is shown
        height: prefilledDrepId ? 340 : 650,
        canDiscard: true,
        onClose: markJustClosed,
      })
    },
    [openModal, strings.staking.enterDRepID, manager, markJustClosed],
  )

  const handleDelegate = React.useCallback(
    (prefilledDrepId?: string) => {
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

        // Close modal immediately - dismiss keyboard first since closeModal returns early if keyboard is open
        Keyboard.dismiss()
        closeModalWrapped()
        submitDelegate(certs, options)
      }, prefilledDrepId)
    },
    [
      isPending,
      openDRepIdModal,
      wallet,
      createDelegationCertificate,
      needsToRegisterStakingKey,
      manager,
      submitDelegate,
      closeModalWrapped,
    ],
  )

  // Check if we have a drepId from props and open modal automatically
  React.useEffect(() => {
    if (
      initialDrepId &&
      !isPending &&
      hasOpenedModalRef.current !== initialDrepId &&
      !justClosedRef.current
    ) {
      // Don't set ref here - set it in openDRepIdModal when modal actually opens
      // Small delay to ensure screen is mounted
      const timer = setTimeout(() => {
        handleDelegate(initialDrepId)
      }, 100)
      return () => {
        clearTimeout(timer)
      }
    }
    return undefined
  }, [initialDrepId, isPending, handleDelegate])

  return (
    <ScrollView
      style={[a.px_lg, a.flex_1, ta.bg_color_max]}
      contentContainerStyle={a.flex_grow}
    >
      <View>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {strings.staking.reviewActions}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.gap_lg]}>
        {isYoroiDrepBannerEnabled && (
          <YoroiDrepCard
            onDelegate={handleDelegateToYoroi}
            pending={isPending}
          />
        )}

        <Action
          title={strings.staking.exploreOtherGovernanceOptions}
          description={strings.staking.exploreOtherGovernanceOptionsDescription}
          onPress={handleExploreOtherOptions}
          showRightArrow
        />
      </View>

      <View style={a.flex_1} />

      <LearnMoreLink />

      <Space.Height.lg />
    </ScrollView>
  )
}
