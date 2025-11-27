import {GovernanceProvider, useGovernance} from '@yoroi/staking'
import {ThemedPalette, atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {useRemoteConfig} from '~/features/RemoteConfig/hooks/useRemoteConfig'
import {GovernanceStatusCard} from '~/features/Staking/Governance/common/GovernanceStatusCard/GovernanceStatusCard'
import {LearnMoreLink} from '~/features/Staking/Governance/common/LearnMoreLink/LearnMoreLink'
import {OtherDrepCard} from '~/features/Staking/Governance/common/OtherDrepCard/OtherDrepCard'
import {YoroiDrepCard} from '~/features/Staking/Governance/common/YoroiDrepCard/YoroiDrepCard'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'

import {Action} from '../../common/Action/Action'
import {
  useHomeScreen,
  useNeverParticipatedGovernance,
  useParticipatingGovernance,
} from '../../common/helpers'
import {GovernanceVote} from '../../types'
import {EnterDrepIdModal} from '../EnterDrepIdModal/EnterDrepIdModal'

export const HomeScreen = () => {
  const {isLoading, pendingAction, confirmedAction} = useHomeScreen()

  if (isLoading) return null

  if (pendingAction !== null) {
    return (
      <ParticipatingInGovernanceVariant action={pendingAction} isTxPending />
    )
  }

  if (confirmedAction !== null) {
    return <ParticipatingInGovernanceVariant action={confirmedAction} />
  }

  return <NeverParticipatedInGovernanceVariant />
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
  const {openModal} = useModal()
  const {manager} = useGovernance()

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
      height: 650,
    })
  }

  const onChangeToDrep = () => {
    openDRepIdModal(handleDelegateToOtherDrep)
  }

  return (
    <ScrollView style={[a.px_lg, a.flex_1, ta.bg_color_max]}>
      <View>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {introduction}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.flex_1, a.gap_lg]}>
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

      <Space.Height.sm fill />

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

const NeverParticipatedInGovernanceVariant = () => {
  const {config} = useRemoteConfig()
  const isYoroiDrepBannerEnabled = config?.banners?.yoroiDrep?.display ?? false
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  const {isPending, handleDelegateToYoroi, handleExploreOtherOptions} =
    useNeverParticipatedGovernance()

  return (
    <ScrollView style={[a.px_lg, a.flex_1, ta.bg_color_max]}>
      <View>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {strings.staking.reviewActions}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.flex_1, a.gap_lg]}>
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

      <Space.Height.sm fill />

      <LearnMoreLink />

      <Space.Height.lg />
    </ScrollView>
  )
}
